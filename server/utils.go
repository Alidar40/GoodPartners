package main

import(
	"fmt"
	"io/ioutil"
	"strings"
	"database/sql"
	"encoding/json"
	"net/http"
	"regexp"

	"github.com/gocraft/web"
	"github.com/golang/glog"
)

type ReplyError struct {
	Code	int	`json:"code"`
	Text	string	`json:"text"`
}

type Response struct {
	Login	string	`json:"login,omitempty"`
	Token	string	`json:"token,omitempty"`
	Users	[]string `json:"users,omitempty"`
}

type ReplyModel struct {
	Err	*ReplyError	`json:"error,omitempty"`
	Res	*Response	`json:"response,omitempty"`
}

//Universal replying method
func (c *Context) Reply(rw web.ResponseWriter, req *web.Request, model *ReplyModel){
	reply, err := json.MarshalIndent(model, "", " ")
	if (err != nil) {
		c.Error = err
		return
	}
	rw.Header().Set("Content-Type", "application/json")
	rw.Write(reply)
}

func HandleBadAuthResponse(rw web.ResponseWriter, req *web.Request, status int){
	if (req.RequestURI == "/docs") {
		http.Redirect(rw, req.Request, "/login", http.StatusFound)
	} else {
		rw.WriteHeader(status)
	}
}

func connectToDb() {

	pgpass, err := ioutil.ReadFile("./.pgpass")
	if err != nil {
		glog.Infof("[ERROR] in main(!) while opening .pgpass: %s", err)
	}

	fmt.Printf("%s", pgpass)
	connectionString := "postgres://" + strings.TrimRight(string(pgpass), "\r\n") + "@localhost/goodpartnersdb"

	db, err = sql.Open("postgres", connectionString);
	if err != nil {
		glog.Infof("[ERROR] in main(!) while opening db: %s", err)
	}

	var name string
	err = db.QueryRow(`select name from test;`).Scan(&name)
	if err != nil {
		glog.Infof("err: %s", err)
	}
	fmt.Println("name: " + name)
}

func ValidateEmail(email string) (err error) {
	rege := regexp.MustCompile("^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$")
	emailCheck := rege.MatchString(email)
	if !emailCheck {
		return err
	}

	return nil
}

func ValidatePassword(password string) (err error) {
	rege := regexp.MustCompile("^(.\\d?)(.\\D?)([a-zA-Z0-9_]{6,20})$")
	passwordCheck := rege.MatchString(password)
	if !passwordCheck {
		return err
	}

	return nil
}
