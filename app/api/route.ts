export const GET = () => {
  return new Response("Hello from the API route!", {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
