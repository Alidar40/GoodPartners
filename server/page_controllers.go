package main

import (
	"net/http"

	"github.com/gocraft/web"
)

func (c *Context) HomePage(rw web.ResponseWriter, req *web.Request) {
	rw.Header().Set("Content-Type", "text/html")
	http.ServeFile(rw, req.Request, "../client/views/index.html")
}
