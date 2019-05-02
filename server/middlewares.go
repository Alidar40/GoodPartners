package main

import(
	"time"
	"net/http"
	"database/sql"

	"github.com/pkg/errors"
	"github.com/gocraft/web"
	"github.com/golang/glog"
)

//Custom logger
func (c *Context) Log(rw web.ResponseWriter, req *web.Request, next web.NextMiddlewareFunc){
	start := time.Now()
	next(rw, req)
	glog.Infof("[%s] [%s %s]", time.Since(start), req.Method, req.URL)
}

//Custom error handler
func (c *Context) HandleError(rw web.ResponseWriter, req *web.Request, next web.NextMiddlewareFunc){
	next(rw, req)

	if (c.Error != nil) {
		glog.Infof("[ERROR] [%s %s] while %s", req.Method, req.URL, c.Error)
		var code int
		var text string

		switch rw.StatusCode() {
			case http.StatusBadRequest:
				code = 400
				text = "Bad request"
			case http.StatusUnauthorized:
				code = 401
				text = "Unauthorized"
			case http.StatusForbidden:
				code = 403
				text = "Forbidden"
			case http.StatusNotFound:
				code = 404
				text = "Not found"
			case http.StatusMethodNotAllowed:
				code = 405
				text = "Method not allowed"
			case http.StatusInternalServerError:
				code = 500
				text = "Internal server error"
			case http.StatusNotImplemented:
				code = 501
				text = "Not implemented"
			case http.StatusServiceUnavailable:
				code = 503
				text = "Service unavailable"
			default:
				code = 500
				text = "Internal server error"
		}

		reply := &ReplyModel{
			Err: &ReplyError{
				Code: code,
				Text: text,
			},
		}

		c.Reply(rw, req, reply)
		return
	}
}

//Authentication check
func (c *Context) AuthCheck(rw web.ResponseWriter, req *web.Request, next web.NextMiddlewareFunc){
	var lastActivityTime time.Time
	var login string

	token, err := req.Cookie("token")
	if (err != nil) {
		if (err == http.ErrNoCookie){
			c.Error = errors.Wrap(err, "signing in without cookie")
			HandleBadAuthResponse(rw, req, http.StatusUnauthorized)
			return
		}
		c.Error = errors.Wrap(err, "parsing token")
		HandleBadAuthResponse(rw, req, http.StatusUnauthorized)
		return
	}

	loginFromCookie, err := req.Cookie("login")
	if (err != nil) {
		if (err == http.ErrNoCookie){
			c.Error = errors.Wrap(err, "signing in without login")
			HandleBadAuthResponse(rw, req, http.StatusUnauthorized)
			return
		}
		c.Error = errors.Wrap(err, "parsing ligin")
		HandleBadAuthResponse(rw, req, http.StatusUnauthorized)
		return
	}

	err = db.QueryRow(`SELECT lastactivitytime, login FROM sessions WHERE token = $1;`, token.Value).Scan(&lastActivityTime, &login)
	if (err != nil) {
		if (err == sql.ErrNoRows){
			c.Error = errors.Wrap(err, "trying to sign in with bad token")
			HandleBadAuthResponse(rw, req, http.StatusUnauthorized)
			return
		}
		c.Error = errors.Wrap(err, "searching for appropriate token in db")
		HandleBadAuthResponse(rw, req, http.StatusUnauthorized)
		return
	}

	if (loginFromCookie.Value != login) {
		err = errors.New("bad login")
		c.Error = errors.Wrap(err, "signing in with bad login")
		HandleBadAuthResponse(rw, req, http.StatusUnauthorized)
		return
	}


	_, err = db.Exec(`UPDATE sessions SET lastactivitytime = now() where token = $1;`, token.Value)
	if (err != nil) {
		c.Error = errors.Wrap(err, "updating session token")
		HandleBadAuthResponse(rw, req, http.StatusInternalServerError)
		return
	}

	next(rw, req)
}


