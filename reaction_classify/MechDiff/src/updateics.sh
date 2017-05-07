cd ics && wget -r -nH --cut-dirs=7 --reject="index.html*"  http://www-users.york.ac.uk/~dp626/force/ics && find . -type f ! -name "*.json" -delete
