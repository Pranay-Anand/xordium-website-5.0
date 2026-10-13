import {Resend} from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET()
{
  const {data, error} = await resend.emails.send(
    {
    from: 'Ignite <noreply@igniteclub.tech>',
    to: ['aayushrambo8@gmail.com'],
    subject: 'Hello World',
    text: 'It works!',
  });

  if (error)
  {
    return Response.json({error}, {status: 500});
  }

  return Response.json(data);
}
