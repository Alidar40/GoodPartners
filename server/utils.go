package main

import(
	"io/ioutil"
	"strings"
	"database/sql"
	"encoding/json"
	"net/http"
	"regexp"
	"time"
	"net/smtp"
	"math/rand"

	"github.com/gocraft/web"
	"github.com/golang/glog"
)

type ReplyError struct {
	Code	int	`json:"code"`
	Text	string	`json:"text"`
}

type Response struct {
	Id	string	`json:"id,omitempty"`
	CompanyId	string	`json:"companyId,omitempty"`
	Login	string	`json:"login,omitempty"`
	Token	string	`json:"token,omitempty"`
	Message	string	`json:"message,omitempty"`
}

type ReplyModel struct {
	Err	*ReplyError	`json:"error,omitempty"`
	Res	*Response	`json:"response,omitempty"`
	PriceList	[]PriceListEntry	`json:"priceList,omitempty"`
	Orders		[]Order		`json:"orders,omitempty"`
}

//Universal replying method
func (c *Context) Reply(rw web.ResponseWriter, req *web.Request, model interface{}){
	reply, err := json.MarshalIndent(model, "", " ")
	if (err != nil) {
		c.Error = err
		return
	}
	rw.Header().Set("Content-Type", "application/json")
	rw.Write(reply)
}

type User struct {
	Id		string	`json:"id"`
	Email		string	`json:"email"`
	Password	string	`json:"password"`
	FirstName	string	`json:"firstName"`
	LastName	string	`json:"lastName"`
	CompanyId	string	`json:"conpanyId"`
}

func HandleBadAuthResponse(rw web.ResponseWriter, req *web.Request, status int){
	if (req.RequestURI == "/docs") {
		http.Redirect(rw, req.Request, "/login", http.StatusFound)
	} else {
		rw.WriteHeader(status)
	}
}

func connectToDb() (error){

	pgpass, err := ioutil.ReadFile("./.pgpass")
	if err != nil {
		glog.Infof("[ERROR] in main(!) while opening .pgpass: %s", err)
		return err
	}

	connectionString := "postgres://" + strings.TrimRight(string(pgpass), "\r\n") + "@localhost/goodpartnersdb"

	db, err = sql.Open("postgres", connectionString);
	if err != nil {
		glog.Infof("[ERROR] in main(!) while opening db: %s", err)
		return err
	}
	return nil

}

func ClearSessions() (error) {
	_, err := db.Exec(`DELETE FROM sessions WHERE last_activity_time < current_timestamp - interval '1 hour';`)
	if err != nil {
		return err
	}
	return nil
}

func InitializeSessionsClearing() (error) {
	ticker := time.NewTicker(30 * time.Minute)
	go func() {
		for _ = range ticker.C {
			err := ClearSessions()
			if err != nil {
				glog.Infof("[ERROR] while clearing sessions: ", err)
				return
			}
		}
	}()
	return nil
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

func Notify(whomId string, message string) (error) {
	_, err := db.Exec(`INSERT INTO notifications
				(whom_id, message)
			   VALUES
			   	($1, $2);`, whomId, message)
	if err != nil {
		return err
	}
	return nil
}

func SendEmail(to string, subject string, msg string) (error) {
	hostname := "smtp.gmail.com"
	adminEmail := "alihotel.mailservice@gmail.com"
	auth := smtp.PlainAuth(
		"",
		adminEmail,
		"vbnm4321",
		hostname,
	)

	err := smtp.SendMail(
		hostname+":587",
		auth,
		adminEmail,
		[]string{to},
		[]byte("To: " + to + "\n" +
			"Subject: " + subject + "\n" +
			"\n" +
			msg + "\n"),
	)

	if err != nil {
		return err
	}

	return nil
}

func GeneratePassword() (string){
	rand.Seed(time.Now().UnixNano())
	chars := []rune("ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ" +
	    "abcdefghijklmnopqrstuvwxyzåäö" +
	    "0123456789")
	length := 8
	var b strings.Builder
	for i := 0; i < length; i++ {
	    b.WriteRune(chars[rand.Intn(len(chars))])
	}
	str := b.String()
	return str
}
