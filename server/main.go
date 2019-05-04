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
	apiRouter.Post("/registration/:typeOfCompany", (*Context).PostRegisterCtrl)
	apiRouter.Get("/supplier/pricelist/:company_id", (*Context).GetPricelistById)
	apiRouter.Put("/supplier/pricelist/edit", (*Context).EditPricelist)
	apiRouter.Post("/invitations/partnership/invite", (*Context).InviteCompany)
	apiRouter.Post("/invitations/partnership/answer", (*Context).AnswerInvitation)
	apiRouter.Post("/order/make", (*Context).MakeOrder)

	rootRouter.Get("/", (*Context).HomePage)

	glog.Info("Server started at port 8000")
	http.ListenAndServe("localhost:8000", rootRouter)
}
