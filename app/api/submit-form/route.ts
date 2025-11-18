import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { url, data, fields } = await request.json();

    if (!url || !url.includes('docs.google.com/forms')) {
      return NextResponse.json(
        { error: 'Invalid Google Forms URL' },
        { status: 400 }
      );
    }

    // Convert the form URL to submission URL
    // From: https://docs.google.com/forms/d/e/{formId}/viewform
    // To: https://docs.google.com/forms/d/e/{formId}/formResponse
    const submitUrl = url.replace('/viewform', '/formResponse');

    // Prepare form data
    const formData = new URLSearchParams();

    fields.forEach((field: any) => {
      const value = data[field.id];
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          // For checkboxes
          value.forEach(v => formData.append(`entry.${field.id}`, v));
        } else {
          formData.append(`entry.${field.id}`, value);
        }
      }
    });

    // Submit the form
    const response = await axios.post(submitUrl, formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      maxRedirects: 0,
      validateStatus: (status) => status < 400 || status === 302
    });

    // Google Forms typically redirects to a confirmation page after successful submission
    if (response.status === 302 || response.status === 200) {
      return NextResponse.json({
        success: true,
        message: 'Form submitted successfully!'
      });
    } else {
      return NextResponse.json(
        { error: 'Form submission may have failed. Please check the form manually.' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error submitting form:', error);

    // Even if we get an error, the form might have been submitted
    // Google Forms often returns 302 redirect which axios treats as error with maxRedirects: 0
    if (error.response?.status === 302) {
      return NextResponse.json({
        success: true,
        message: 'Form submitted successfully!'
      });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to submit form' },
      { status: 500 }
    );
  }
}
