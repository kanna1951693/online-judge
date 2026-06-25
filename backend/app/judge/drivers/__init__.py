from backend.app.judge.drivers.python_driver import PythonDriverGenerator
from backend.app.judge.drivers.cpp_driver import CppDriverGenerator
from backend.app.judge.drivers.java_driver import JavaDriverGenerator
from backend.app.judge.drivers.base import DriverGenerator

def get_driver_generator(lang: str) -> DriverGenerator:
    l = lang.lower().strip()
    if l == "python":
        return PythonDriverGenerator()
    elif l == "cpp":
        return CppDriverGenerator()
    elif l == "java":
        return JavaDriverGenerator()
    else:
        raise ValueError(f"No driver generator for language: {lang}")
