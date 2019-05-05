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

	err := connectToDb()
	if err != nil {
		return
	}
	defer db.Close()

	err = InitializeSessionsClearing()
	if err != nil {
		return
	}

	rootRouter := web.New(Context{}).
		Middleware((*Context).Log).
		Middleware((*Context).HandleError)

	apiRouterUnauthorized := rootRouter.Subrouter(Context{}, "/api")
	apiRouterUnauthorized.Post("/auth/registration/:typeOfCompany", (*Context).PostRegisterCtrl)
	apiRouterUnauthorized.Post("/auth/login", (*Context).Login)

	apiRouter := rootRouter.Subrouter(Context{}, "/api").
		Middleware((*Context).AuthCheck)
	apiRouter.Get("/supplier/pricelist/:company_id", (*Context).GetPricelistById)
	apiRouter.Put("/supplier/pricelist/edit", (*Context).EditPricelist)
	apiRouter.Post("/invitations/partnership/invite", (*Context).InviteCompany)
	apiRouter.Post("/invitations/partnership/answer", (*Context).AnswerInvitation)
	apiRouter.Post("/order/make", (*Context).MakeOrder)
	apiRouter.Post("/order/answer/:answer/id/:id", (*Context).AnswerToOrder)
	apiRouter.Post("/order/close/:id", (*Context).CloseOrder)

	rootRouter.Get("/", (*Context).HomePage)

	glog.Info("Server started at port 8000")
	http.ListenAndServe("localhost:8000", rootRouter)
}
