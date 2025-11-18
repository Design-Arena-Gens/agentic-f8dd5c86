import { NextRequest, NextResponse } from 'next/server';

const sampleNames = ['John Smith', 'Jane Doe', 'Alice Johnson', 'Bob Williams', 'Emma Brown'];
const sampleEmails = ['john@example.com', 'jane@example.com', 'alice@example.com', 'bob@example.com', 'emma@example.com'];
const sampleTexts = [
  'This is a sample response for testing purposes.',
  'I found this form very helpful and easy to use.',
  'Great experience overall, would recommend to others.',
  'The interface is intuitive and user-friendly.',
  'Looking forward to future improvements.'
];
const sampleNumbers = ['5', '4', '3', '8', '7'];

export async function POST(request: NextRequest) {
  try {
    const { fields } = await request.json();
    const data: Record<string, any> = {};

    fields.forEach((field: any) => {
      const random = Math.floor(Math.random() * 5);

      switch (field.type) {
        case 'text':
          if (field.label.toLowerCase().includes('name')) {
            data[field.id] = sampleNames[random];
          } else if (field.label.toLowerCase().includes('email')) {
            data[field.id] = sampleEmails[random];
          } else if (field.label.toLowerCase().includes('phone')) {
            data[field.id] = `+1 (555) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;
          } else if (field.label.toLowerCase().includes('age') || field.label.toLowerCase().includes('number')) {
            data[field.id] = sampleNumbers[random];
          } else {
            data[field.id] = sampleTexts[random];
          }
          break;

        case 'email':
          data[field.id] = sampleEmails[random];
          break;

        case 'textarea':
          data[field.id] = sampleTexts[random];
          break;

        case 'radio':
          if (field.options && field.options.length > 0) {
            data[field.id] = field.options[Math.floor(Math.random() * field.options.length)];
          }
          break;

        case 'select':
          if (field.options && field.options.length > 0) {
            data[field.id] = field.options[Math.floor(Math.random() * field.options.length)];
          }
          break;

        case 'checkbox':
          if (field.options && field.options.length > 0) {
            const numToSelect = Math.floor(Math.random() * Math.min(3, field.options.length)) + 1;
            const shuffled = [...field.options].sort(() => 0.5 - Math.random());
            data[field.id] = shuffled.slice(0, numToSelect);
          }
          break;

        default:
          data[field.id] = sampleTexts[random];
      }
    });

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error auto-filling form:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to auto-fill form' },
      { status: 500 }
    );
  }
}
