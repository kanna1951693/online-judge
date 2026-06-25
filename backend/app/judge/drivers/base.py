from abc import ABC, abstractmethod
from typing import Any

class DriverGenerator(ABC):
    @abstractmethod
    def generate(self, user_code: str, signature: Any, test_input_json: str) -> str:
        """
        Generates the complete, compilable source code file content
        that contains the user's code, the standard Node definitions,
        deserialization of input arguments, calling the function, and
        serialization of the return type to stdout.
        """
        pass
