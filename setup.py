# -*- coding: utf-8 -*-
from setuptools import find_packages, setup

try:
    long_description = open("README.rst").read()
except IOError:
    long_description = ""

setup(
    name="gimmespace",
    version="0.1.0",
    description="Clear public ways from illegal parking.",
    license="AGPL-3",
    author="Fabian Köster",
    packages=find_packages(),
    install_requires=[],
    long_description=long_description,
    classifiers=[
        "Programming Language :: Python",
        "Programming Language :: Python :: 3.6",
    ]
)
