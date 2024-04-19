import logging
logger = logging.getLogger(__name__)

class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        logger.debug(f"Request Headers: {request.headers}")
        logger.debug(f"Request Cookies: {request.COOKIES}")
        logger.debug(f"Request Path: {request.path}")
        return response