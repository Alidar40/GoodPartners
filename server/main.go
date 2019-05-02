package main

import (
	"flag"
	"database/sql"
	"net/http"

	"github.com/gocraft/web"
	_ "github.com/lib/pq"
	"github.com/golang/glog"
)

var(
	db *sql.DB
)

type Context struct {
	Error error
}

func main() {
	flag.Set("logtostderr", "true")
	flag.Set("v", "2")
	flag.Parse()

	connectToDb()
	defer db.Close()

	router := web.New(Context{}).
		Middleware((*Context).Log).
		Middleware((*Context).HandleError)

	router.Subrouter(Context{}, "/api").Post("/register/supplier", (*Context).PostRegisterCtrl)
	router.Subrouter(Context{}, "/api").Post("/register/buyer", (*Context).PostRegisterCtrl)

	router.Get("/", (*Context).HomePage)

	glog.Info("Server started at port 8000")
	http.ListenAndServe("localhost:8000", router)
}
