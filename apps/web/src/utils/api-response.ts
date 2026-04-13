export function successResponse<T>(data: T, status = 200): Response {
  return Response.json({ success: true, data }, { status })
}

export function errorResponse(
  code: string,
  message: string,
  status = 400,
): Response {
  return Response.json({ success: false, error: { code, message } }, { status })
}
