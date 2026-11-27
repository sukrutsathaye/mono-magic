"""Generic data repository contracts and abstract base class."""

from .repository_base import BaseDataRepository
from .repository_interface import DataRepository

__all__ = [
    "BaseDataRepository",
    "DataRepository",
]
