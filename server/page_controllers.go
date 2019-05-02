package main

import (
	"fmt"

	"github.com/gocraft/web"
)

func (c *Context) HomePage(rw web.ResponseWriter, req *web.Request) {
	rw.Header().Set("Content-Type", "text/html")
	fmt.Fprint(rw, "Hi there")
}
