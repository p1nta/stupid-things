start: ## Start simple python v3 server with all pages
	cd src && python3 -m http.server 3000

start_python2: ## Start simple python v2 server with all pages
	cd src && python -m SimpleHTTPServer 3000
