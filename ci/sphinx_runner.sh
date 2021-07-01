#!/bin/bash

cd docs
export PYTHONPATH=..
make -f html
cd ..

