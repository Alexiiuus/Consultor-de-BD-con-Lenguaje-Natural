class AppException(Exception):
    status_code: int = 500
    detail: str = "Internal server error"


class NotFoundException(AppException):
    status_code = 404
    detail = "Resource not found"


class UnauthorizedException(AppException):
    status_code = 401
    detail = "Not authenticated"
