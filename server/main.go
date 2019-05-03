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

	rootRouter := web.New(Context{}).
		Middleware((*Context).Log).
		Middleware((*Context).HandleError)

	apiRouter := rootRouter.Subrouter(Context{}, "/api")
	apiRouter.Post("/registration/supplier", (*Context).PostRegisterCtrl)
	apiRouter.Post("/registration/buyer", (*Context).PostRegisterCtrl)
	apiRouter.Get("/supplier/pricelist/:company_id", (*Context).GetPricelistById)

	rootRouter.Get("/", (*Context).HomePage)

	glog.Info("Server started at port 8000")
	http.ListenAndServe("localhost:8000", rootRouter)
}
