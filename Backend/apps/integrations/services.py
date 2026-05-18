from .models import APILog


def log_api_call(integration, endpoint, request_data, response_data, status_code):
    APILog.objects.create(
        integration=integration,
        endpoint=endpoint,
        request_data=request_data,
        response_data=response_data,
        status_code=status_code
    )