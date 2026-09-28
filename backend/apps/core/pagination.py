"""Project-wide pagination.

Wraps the standard page-number pagination but returns a consistent envelope:

    {
        "data": [ ... ],
        "meta": {
            "page": 1,
            "page_size": 20,
            "total": 57,
            "total_pages": 3
        }
    }
"""

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response(
            {
                "data": data,
                "meta": {
                    "page": self.page.number,
                    "page_size": self.get_page_size(self.request),
                    "total": self.page.paginator.count,
                    "total_pages": self.page.paginator.num_pages,
                },
            }
        )
