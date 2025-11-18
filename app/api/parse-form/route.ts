import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || !url.includes('docs.google.com/forms')) {
      return NextResponse.json(
        { error: 'Invalid Google Forms URL' },
        { status: 400 }
      );
    }

    // Fetch the form HTML
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const fields: any[] = [];

    // Try to parse form data from the page
    // Google Forms embed the form structure in JavaScript variables
    const scriptContent = $('script').text();

    // Look for FB_PUBLIC_LOAD_DATA_ which contains form metadata
    const fbDataMatch = scriptContent.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*(\[.+?\]);/s);

    if (fbDataMatch) {
      try {
        const formData = JSON.parse(fbDataMatch[1]);

        // Navigate the complex structure to find questions
        const questions = formData[1]?.[1];

        if (Array.isArray(questions)) {
          questions.forEach((question: any, index: number) => {
            if (Array.isArray(question) && question[1]) {
              const questionText = question[1];
              const questionId = question[4]?.[0]?.[0] || `field_${index}`;
              const questionType = question[3];
              const isRequired = question[4]?.[0]?.[2] === 1;

              let fieldType = 'text';
              let options: string[] | undefined;

              // Map Google Forms question types to our field types
              switch (questionType) {
                case 0: // Short answer
                  fieldType = 'text';
                  break;
                case 1: // Paragraph
                  fieldType = 'textarea';
                  break;
                case 2: // Multiple choice
                  fieldType = 'radio';
                  options = question[4]?.[0]?.[1]?.map((opt: any) => opt[0]) || [];
                  break;
                case 3: // Dropdown
                  fieldType = 'select';
                  options = question[4]?.[0]?.[1]?.map((opt: any) => opt[0]) || [];
                  break;
                case 4: // Checkboxes
                  fieldType = 'checkbox';
                  options = question[4]?.[0]?.[1]?.map((opt: any) => opt[0]) || [];
                  break;
                case 9: // Date
                  fieldType = 'text';
                  break;
                case 10: // Time
                  fieldType = 'text';
                  break;
              }

              fields.push({
                id: questionId.toString(),
                name: `entry.${questionId}`,
                type: fieldType,
                label: questionText,
                required: isRequired,
                options
              });
            }
          });
        }
      } catch (parseError) {
        console.error('Error parsing form data:', parseError);
      }
    }

    // Fallback: Parse visible form elements if JS parsing fails
    if (fields.length === 0) {
      $('.freebirdFormviewerComponentsQuestionBaseRoot').each((index, element) => {
        const $element = $(element);
        const label = $element.find('.freebirdFormviewerComponentsQuestionBaseTitle').text().trim();
        const required = $element.find('.freebirdFormviewerComponentsQuestionBaseRequiredAsterisk').length > 0;

        let type = 'text';
        let options: string[] | undefined;

        if ($element.find('textarea').length > 0) {
          type = 'textarea';
        } else if ($element.find('input[type="radio"]').length > 0) {
          type = 'radio';
          options = [];
          $element.find('.freebirdFormviewerComponentsQuestionRadioLabel').each((i, opt) => {
            options?.push($(opt).text().trim());
          });
        } else if ($element.find('input[type="checkbox"]').length > 0) {
          type = 'checkbox';
          options = [];
          $element.find('.freebirdFormviewerComponentsQuestionCheckboxLabel').each((i, opt) => {
            options?.push($(opt).text().trim());
          });
        } else if ($element.find('select').length > 0) {
          type = 'select';
          options = [];
          $element.find('option').each((i, opt) => {
            const text = $(opt).text().trim();
            if (text) options?.push(text);
          });
        }

        if (label) {
          fields.push({
            id: `field_${index}`,
            name: `entry.${index}`,
            type,
            label,
            required,
            options
          });
        }
      });
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { error: 'Could not parse form fields. The form might be protected or in an unsupported format.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ fields });
  } catch (error: any) {
    console.error('Error parsing form:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse form' },
      { status: 500 }
    );
  }
}
