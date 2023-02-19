export async function createSuccessResponse(message, data, status) {
  return {
    success: true,
    status,
    message,
    statusCode: 200,
    data: data ? data : 'NO_DATA',
  };
}
