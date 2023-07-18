#!/bin/bash
directory_path=$1

if [ -d "$directory_path" ]; then
  echo "Directory exists, proceeding..."
else
  echo "Directory does not exist"
  exit 0
fi

directories=$(find "$directory_path/libraries" -mindepth 1 -maxdepth 1 -type d)

if test -f "./webadb.packages.txt"; then
    rm webadb.packages.txt
    touch webadb.packages.txt
else
    touch webadb.packages.txt
fi

for dir in $directories; do
  npm install "$dir" --save
  package=$(echo $dir | awk -F '/' '{print $NF}')
  echo "@yume-chan/$package" >> webadb.packages.txt
done