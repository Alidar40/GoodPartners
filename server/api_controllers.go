package main

import(
	"net/http"
	"crypto/sha256"
	"encoding/json"
	"encoding/hex"
	"database/sql"

	"github.com/gocraft/web"
	"github.com/pkg/errors"
	"github.com/satori/go.uuid"
)

type PriceListEntry struct {
	Id	string	`json:"id,omitempty"`
	CompanyId	string	`json:"companyId,omitempty"`
	Sku	string	`json:"sku"`
	Name	string	`json:"name"`
	Units	string	`json:"units"`
	Price	float64	`json:"price"`
	Category	string	`json:"category,omitempty"`
	Description	string	`json:"description,omitempty"`
	Count	int	`json:"count,omitempty"`
}


type RegisterForm struct {
	Email	string	`json:"email"`
	Password	string	`json:"password"`
	FirstName	string	`json:"firstName"`
	LastName	string	`json:"lastName"`
	Title		string	`json:"title"`
	CompanyName	string	`json:"companyName"`
	CompanyDescription	string	`json:"companyDescription`
	CompanyWebsite		string	`json:"companyWebsite,omitempty"`
	CompanyEmail	string	`json:"companyEmail"`
	PriceList		[]PriceListEntry	`json:"priceList"`
}

type LoginForm struct {
	Email	string	`json:"email"`
	Password	string	`json:"password"`
}

type PriceListEditForm struct {
	Insert	[]PriceListEntry	`json:"insert,omitempty"`
	Update	[]PriceListEntry	`json:"update,omitempty"`
	Delete	[]PriceListEntry	`json:"delete,omitpemty"`
}

type InvitationForm struct {
	InvitedCompanyId	string	`json:"invitedCompanyId"`
	Message		string	`json:"message,omitempty"`
}

type MakeOrderEntry struct {
	Id	string	`json:"id"`
	Count	int	`json:"count"`
}

type MakeOrderForm struct {
	SupplierId	string	`json:"supplierId"`
	Entries	[]MakeOrderEntry	`json:"entries"`
	Comment		string	`json:"comment"`
}

type Order struct {
	Id		string	`json:"id"`
	SupplierId	string	`json:"supplierId"`
	SupplierName	string	`json:"supplierName"`
	BuyerId		string	`json:"buyerId"`
	BuyerName	string	`json:"buyerName"`
	DateOrdered	string	`json:"dateOrdered"`
	Comment		string	`json:"comment"`
	IsAccepted	bool	`json:"isAccepted"`
	DateAccepted	string	`json:"dateAccepted"`
	IsClosed	bool	`json:"isClosed"`
	DateClosed	string	`json:"dateClosed"`
}

type Company struct {
	Id		string	`json:"id"`
	Name		string	`json:"name"`
	Description	string	`json:"description"`
	Website		string	`json:"website"`
	Email		string	`json:"email"`
}

func (c *Context) PostRegisterCtrl(rw web.ResponseWriter, req *web.Request) {
	var regForm	RegisterForm

	decoder := json.NewDecoder(req.Body)
	err := decoder.Decode(&regForm)
	if err != nil {
		c.Error = errors.Wrap(err, "parsing register form")
		rw.WriteHeader(http.StatusBadRequest)
		return
	}

	isSupplier := false
	typeOfCompany := req.PathParams["typeOfCompany"]
	if typeOfCompany == "supplier" {
		isSupplier = true
	} else if typeOfCompany != "buyer" {
		c.Error = errors.Wrap(errors.New("company can be either of type \"supplier\" or \"buyer\""), "register with bad company type")
		rw.WriteHeader(http.StatusBadRequest)
		return
	}

	err = ValidateEmail(regForm.Email)
	if err != nil {
		c.Error = errors.Wrap(err, "register with bad email")
		rw.WriteHeader(http.StatusBadRequest)
		return
	}

	err = ValidatePassword(regForm.Password)
	if err != nil {
		c.Error = errors.Wrap(err, "register with bad password")
		rw.WriteHeader(http.StatusBadRequest)
		return
	}

	if regForm.CompanyName == "" {
		c.Error = errors.Wrap(err, "register with empty company name")
		rw.WriteHeader(http.StatusBadRequest)
		return
	}

	if isSupplier && len(regForm.PriceList) == 0 {
		c.Error = errors.Wrap(err, "register with empty price list")
		rw.WriteHeader(http.StatusBadRequest)
		return
	}

	pswdHash := sha256.Sum256([]byte(regForm.Password))
	pswdHashStr := hex.EncodeToString(pswdHash[:])

	_, err = db.Exec(`INSERT INTO companies (name, description, website, email, is_supplier)
				VALUES ($1, $2, $3, $4, $5);`, regForm.CompanyName, regForm.CompanyDescription, regForm.CompanyWebsite, regForm.CompanyEmail, isSupplier)
	if err != nil {
		c.Error = errors.Wrap(err, "inserting new company")
		rw.WriteHeader(http.StatusBadRequest)
		return
	}

	var companyId string
	err = db.QueryRow(`SELECT id FROM companies WHERE name = $1;`, regForm.CompanyName).Scan(&companyId)

	_, err = db.Exec(`INSERT INTO users (email, password_hash, first_name, last_name, company_id, role_id, title)
			VALUES ($1, $2, $3, $4, $5, $6, $7);`, regForm.Email, pswdHashStr, regForm.FirstName, regForm.LastName, companyId, 2, regForm.Title)
	if err != nil {
		c.Error = errors.Wrap(err, "inserting new user")
		rw.WriteHeader(http.StatusBadRequest)
		return
	}

	if isSupplier {
		for _, i := range regForm.PriceList {
			_, err = db.Exec(`INSERT INTO pricelist (company_id, sku, name, units, price, category, description) VALUES ($1, $2, $3, $4, $5, $6, $7);`, companyId, i.Sku, i.Name, i.Units, i.Price, i.Category, i.Description)
			if err != nil {
				c.Error = errors.Wrap(err, "inserting price item")
				continue
			}
		}
	}

	reply := &ReplyModel {
		Res: &Response {
			Login: regForm.Email,
		},
	}
	rw.WriteHeader(http.StatusCreated)
	c.Reply(rw, req, reply)

}

func (c *Context) Login(rw web.ResponseWriter, req *web.Request) {
	var loginForm	LoginForm

	decoder := json.NewDecoder(req.Body)
	err := decoder.Decode(&loginForm)
	if err != nil {
		c.Error = errors.Wrap(err, "parsing login form")
		rw.WriteHeader(http.StatusBadRequest)
		return
	}

	pswdHash := sha256.Sum256([]byte(loginForm.Password))
	pswdHashStr := hex.EncodeToString(pswdHash[:])

	var id, companyId string
	err = db.QueryRow(`SELECT id, company_id FROM users WHERE email = $1 and password_hash = $2;`, loginForm.Email, pswdHashStr).Scan(&id, &companyId)
	if (err != nil) {
		if (err == sql.ErrNoRows) {
			c.Error = errors.Wrap(err, "authenticating with wrong credentials")
			rw.WriteHeader(http.StatusBadRequest)
			return
		}
		c.Error = errors.Wrap(err, "querying users")
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	var isSupplier string
	err = db.QueryRow(`SELECT is_supplier FROM companies WHERE id = $1;`, companyId).Scan(&isSupplier)
	if err != nil {
		c.Error = errors.Wrap(err, "querying company")
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	_, err = db.Exec(`DELETE FROM sessions WHERE user_id=$1`, id)
	if (err != nil) {
		c.Error = errors.Wrap(err, "deleting previous sessions of user " + loginForm.Email)
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	tokenRaw, err := uuid.NewV4()
	if (err != nil) {
		c.Error = errors.Wrap(err, "generating token")
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	_, err = db.Exec(`INSERT INTO sessions (user_id, token) VALUES($1, $2)`, id, tokenRaw.String())
	if (err != nil) {
		c.Error = errors.Wrap(err, "creating session for user " + loginForm.Email)
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	reply := &ReplyModel{
		Res: &Response{
			Id: id,
			CompanyId: companyId,
			Token: tokenRaw.String(),
		},
	}

	http.SetCookie(rw, &http.Cookie{Name: "id", Value: id, Path: "/"})
	http.SetCookie(rw, &http.Cookie{Name: "companyId", Value: companyId, Path: "/"})
	http.SetCookie(rw, &http.Cookie{Name: "token", Value: tokenRaw.String(), Path: "/"})
	http.SetCookie(rw, &http.Cookie{Name: "isSupplier", Value: isSupplier, Path: "/"})
	rw.WriteHeader(http.StatusOK)
	c.Reply(rw, req, reply)
}

func (c *Context) Logout(rw web.ResponseWriter, req *web.Request) {
	token, err := req.Cookie("token")
	if err != nil {
		c.Error = errors.Wrap(err, "parsing token")
		HandleBadAuthResponse(rw, req, http.StatusUnauthorized)
		return
	}

	_, err = db.Exec(`DELETE FROM sessions WHERE token=$1;`, token.Value)
	if (err != nil) {
		c.Error = errors.Wrap(err, "deleting session for token " + token.Value)
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	reply := &ReplyModel {
		Res: &Response {
			Message: "success",
		},
	}

	http.SetCookie(rw, &http.Cookie{Name: "id", MaxAge: -1, Value: "", Path: "/"})
	http.SetCookie(rw, &http.Cookie{Name: "companyId", MaxAge: -1, Value: "", Path: "/"})
	http.SetCookie(rw, &http.Cookie{Name: "token", MaxAge: -1, Value: "", Path: "/"})
	http.SetCookie(rw, &http.Cookie{Name: "isSupplier", MaxAge: -1, Value: "", Path: "/"})
	rw.WriteHeader(http.StatusOK)
	c.Reply(rw, req, reply)
}

func (c *Context) GetPricelistById(rw web.ResponseWriter, req *web.Request) {
	companyId := req.PathParams["company_id"]

	result, err := db.Query(`SELECT id, sku, name, units, price, category, description 
			    FROM pricelist
			    WHERE company_id = $1
			    ORDER BY name`, companyId)

	if err != nil {
		c.Error = errors.Wrap(err, "querying pricelist")
		rw.WriteHeader(http.StatusBadRequest)
		return
	}
	defer result.Close()

	var pricelist []PriceListEntry
	for result.Next() {
		ple := new(PriceListEntry)
		err = result.Scan(&ple.Id, &ple.Sku, &ple.Name, &ple.Units, &ple.Price, &ple.Category, &ple.Description)
		if err != nil {
			c.Error = errors.Wrap(err, "scanning result")
			rw.WriteHeader(http.StatusInternalServerError)
			return
		}
		pricelist = append(pricelist, *ple)

	}

	if len(pricelist) == 0 {
		rw.WriteHeader(http.StatusNotFound)
	} else {
		rw.WriteHeader(http.StatusOK)
	}
	c.Reply(rw, req, pricelist)
}

func (c *Context) EditPricelist(rw web.ResponseWriter, req *web.Request) {
	var plef PriceListEditForm
	companyId, err := req.Cookie("companyId")
	if err != nil {
		c.Error = errors.Wrap(err, "parsing company id")
		rw.WriteHeader(http.StatusUnauthorized)
		return
	}

	decoder := json.NewDecoder(req.Body)
	err = decoder.Decode(&plef)
	if err != nil {
		c.Error = errors.Wrap(err, "parsing EditPricelistForm")
		rw.WriteHeader(http.StatusBadRequest)
		return
	}

	for _, i := range plef.Insert {
		_, err = db.Exec(`INSERT INTO pricelist (company_id, sku, name, units, price, category, description) VALUES ($1, $2, $3, $4, $5, $6, $7);`, companyId.Value, i.Sku, i.Name, i.Units, i.Price, i.Category, i.Description)
		if err != nil {
			c.Error = errors.Wrap(err, "inserting price item")
			rw.WriteHeader(http.StatusBadRequest)
			return
		}
	}

	for _, i := range plef.Update {
		_, err = db.Exec(`UPDATE pricelist
				  SET sku=$1,
				      name=$2,
				      units=$3,
				      price=$4,
				      category=$5,
				      description=$6
				  WHERE id=$7`, i.Sku, i.Name, i.Units, i.Price, i.Category, i.Description, companyId.Value)
		if err != nil {
			c.Error = errors.Wrap(err, "updating price item")
			rw.WriteHeader(http.StatusBadRequest)
			return
		}
	}


	for _, i := range plef.Delete {
		_, err = db.Exec(`DELETE FROM pricelist WHERE id=$1 and company_id=$2`, i.Id, companyId.Value)
		if err != nil {
			c.Error = errors.Wrap(err, "deleting price item")
			rw.WriteHeader(http.StatusBadRequest)
			return
		}
	}

	reply := &ReplyModel {
		Res: &Response {
			Message: "success",
		},
	}
	rw.WriteHeader(http.StatusOK)
	c.Reply(rw, req, reply)
}

func (c *Context) InviteCompany(rw web.ResponseWriter, req *web.Request) {
	var invitationForm InvitationForm
	var invitedCompanyId = req.PathParams["id"]
	companyId, err := req.Cookie("companyId")
	if err != nil {
		c.Error = errors.Wrap(err, "parsing company id")
		rw.WriteHeader(http.StatusUnauthorized)
		return
	}

	decoder := json.NewDecoder(req.Body)
	err = decoder.Decode(&invitationForm)
	if err != nil {
		c.Error = errors.Wrap(err, "parsing invitation form")
		rw.WriteHeader(http.StatusBadRequest)
		return
	}


	result, err := db.Query(`SELECT is_supplier FROM companies WHERE id=$1 OR id=$2`, companyId.Value, invitedCompanyId);
	if err != nil {
		c.Error = errors.Wrap(err, "querying companies type")
		rw.WriteHeader(http.StatusBadRequest)
		return
	}

	var id1 string
	var id2 string
	result.Next()
	err = result.Scan(&id1)
	if err != nil {
		c.Error = errors.Wrap(err, "scanning first result")
		rw.WriteHeader(http.StatusBadRequest)
		return
	}

	result.Next()
	err = result.Scan(&id2)
	if err != nil {
		c.Error = errors.Wrap(err, "scanning second result")
		rw.WriteHeader(http.StatusBadRequest)
		return
	}

	if id1 == id2 {
		c.Error = errors.Wrap(errors.New("companies of the same type can not be partners"), "got companies of the same type")
		rw.WriteHeader(http.StatusBadRequest)
		return
	}

	//TODO(Alidar) Check that there is no similar invitations (using trigger?)

	// Check that they are not partners already
	var placeholder string
	err = db.QueryRow(`SELECT buyer_id  FROM partners WHERE (buyer_id=$1 AND supplier_id=$2) OR (buyer_id=$2 AND supplier_id=$1);`, companyId.Value, invitedCompanyId).Scan(&placeholder)
	if err != nil {
		if err != sql.ErrNoRows {
			c.Error = errors.Wrap(err, "checking for partnership")
			rw.WriteHeader(http.StatusBadRequest)
			return
		}
	}


	_, err = db.Exec(`INSERT INTO partnership_invitations (from_id, to_id, message)
			   VALUES ($1, $2, $3)`, companyId.Value, invitedCompanyId, invitationForm.Message)
	if err != nil {
		c.Error = errors.Wrap(err, "inserting invitation")
		rw.WriteHeader(http.StatusBadRequest)
		return
	}


	err = Notify(invitedCompanyId, "You have received a partnership invitation")
	if err != nil {
		c.Error = errors.Wrap(err, "notificating")
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}


	reply := &ReplyModel {
		Res: &Response {
			Message: "success",
		},
	}
	rw.WriteHeader(http.StatusCreated)
	c.Reply(rw, req, reply)
}

func (c *Context) AnswerInvitation (rw web.ResponseWriter, req *web.Request) {
	var answer = req.PathParams["answer"]
	var invitationId = req.PathParams["id"]
	companyId, err := req.Cookie("companyId")
	if err != nil {
		c.Error = errors.Wrap(err, "parsing company id")
		rw.WriteHeader(http.StatusUnauthorized)
		return
	}

	isAccepted := false
	if answer == "accepted" {
		isAccepted = true
	} else if answer != "declined" {
		c.Error = errors.Wrap(errors.New("answer can be either \"accepted\" or \"declined\""), "got bad invitation answer")
		rw.WriteHeader(http.StatusBadRequest)
		return
	}

	var toId string
	var fromId string
	var dateAnswered sql.NullString
	err = db.QueryRow(`SELECT to_id, from_id, date_answered FROM partnership_invitations WHERE id=$1;`, invitationId).Scan(&toId, &fromId, &dateAnswered)
	if err != nil {
		c.Error = errors.Wrap(err, "querying invitation reciever's id")
		rw.WriteHeader(http.StatusBadRequest)
		return
	}

	if toId != companyId.Value {
		c.Error = errors.Wrap(errors.New("attempt to answer a foreign's invitations"), "checking user and resiever's ids")
		rw.WriteHeader(http.StatusForbidden)
		return
	}

	if dateAnswered.Valid {
		c.Error = errors.Wrap(errors.New("attempt to answer an already answered invitation"), "checking whether invitaion is answered")
		rw.WriteHeader(http.StatusBadRequest)
		return
	}

	_, err = db.Exec(`UPDATE partnership_invitations SET is_accepted=$1, date_answered=NOW() WHERE id=$2`, isAccepted, invitationId)
	if err != nil {
		c.Error = errors.Wrap(err, "updating invitations table")
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	isSupplier, err := req.Cookie("isSupplier")
	if err != nil {
		c.Error = errors.Wrap(err, "parsing isSupplier")
		rw.WriteHeader(http.StatusUnauthorized)
		return
	}
	if isSupplier.Value == "true" {
		_, err = db.Exec(`INSERT INTO partners (buyer_id, supplier_id)
					VALUES ($1, $2);`, fromId, toId)
	} else {
		_, err = db.Exec(`INSERT INTO partners (buyer_id, supplier_id)
					VALUES ($1, $2);`, toId, fromId)
	}
	if err != nil {
		c.Error = errors.Wrap(err, "inserting partners")
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	err = Notify(fromId, "Your invitation has been " + answer)
	if err != nil {
		c.Error = errors.Wrap(err, "notificating")
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}


	reply := &ReplyModel {
		Res: &Response {
			Message: "success",
		},
	}
	rw.WriteHeader(http.StatusOK)
	c.Reply(rw, req, reply)
}

func (c *Context) MakeOrder(rw web.ResponseWriter, req *web.Request) {
	var makeOrderForm MakeOrderForm

	companyId, err := req.Cookie("companyId")
	if err != nil {
		c.Error = errors.Wrap(err, "parsing company id")
		rw.WriteHeader(http.StatusUnauthorized)
		return
	}

	decoder := json.NewDecoder(req.Body)
	err = decoder.Decode(&makeOrderForm)
	if err != nil {
		c.Error = errors.Wrap(err, "parsing make order form")
		rw.WriteHeader(http.StatusBadRequest)
		return
	}

	for _, i := range makeOrderForm.Entries {
		if i.Count <= 0 {
			c.Error = errors.Wrap(errors.New("wrong count of products"), "checking count of products")
			rw.WriteHeader(http.StatusBadRequest)
			return
		}
	}

	//TODO(Alidar)Check that order is made by buyer - middleware
	//TODO(Alidar)Check that companies are partners - trigger?

	//Check that supplier actually have that stuff
	result, err := db.Query(`SELECT id, sku, name, units, price, category, description
				 FROM pricelist
				 WHERE company_id=$1;`, makeOrderForm.SupplierId)
	if err != nil {
		c.Error = errors.Wrap(err, "querying pricelist")
		rw.WriteHeader(http.StatusBadRequest)
		return
	}

	countOfOrderItems := len(makeOrderForm.Entries)
	var ple PriceListEntry
	var pl	[]PriceListEntry
	for result.Next() {
		err = result.Scan(&ple.Id, &ple.Sku, &ple.Name, &ple.Units, &ple.Price, &ple.Category, &ple.Description)
		if err != nil {
			c.Error = errors.Wrap(err, "scanning pricelist entries")
			rw.WriteHeader(http.StatusInternalServerError)
			return
		}

		for _, i := range makeOrderForm.Entries {
			if i.Id == ple.Id {
				countOfOrderItems--
				ple.Count = i.Count
				pl = append(pl, ple)
				break
			}
		}
	}
	if countOfOrderItems != 0 {
		c.Error = errors.Wrap(errors.New("it is not possible to order something that supplier doesn't have"), "checking availability of a product")
		rw.WriteHeader(http.StatusBadRequest)
		return
	}

	//Insert data into orders table
	_, err = db.Exec(`INSERT INTO orders (buyer_id, supplier_id, comment) VALUES ($1, $2, $3);`, companyId.Value, makeOrderForm.SupplierId, makeOrderForm.Comment)
	if err != nil {
		c.Error = errors.Wrap(err, "inserting into orders table")
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	result, err = db.Query(`SELECT id, MAX(date_ordered) as last_date 
			   FROM orders 
			   GROUP BY id, buyer_id, supplier_id, comment
			   ORDER BY last_date DESC;`)
	if err != nil {
		c.Error = errors.Wrap(err, "getting order id")
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	var orderId string
	var placeholder string
	for result.Next() {
		err = result.Scan(&orderId, &placeholder)
		if err != nil {
			c.Error = errors.Wrap(err, "scanning order id")
			rw.WriteHeader(http.StatusInternalServerError)
			return
		}
		break
	}

	for _, i := range pl {
		_, err := db.Exec(`INSERT INTO order_items 
					(order_id, sku, name, units, price, count, category, description)
				   VALUES
				   	($1, $2, $3, $4, $5, $6, $7, $8)`, orderId, i.Sku, i.Name, i.Units, i.Price, i.Count, i.Category, i.Description)
		if err != nil {
			c.Error = errors.Wrap(err, "inserting order items")
			rw.WriteHeader(http.StatusInternalServerError)
			return
		}
	}

	err = Notify(makeOrderForm.SupplierId, "You have recieved the new order!")
	if err != nil {
		c.Error = errors.Wrap(err, "notificating")
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}



	reply := &ReplyModel {
		Res: &Response {
			Message: "success",
		},
	}
	rw.WriteHeader(http.StatusCreated)
	c.Reply(rw, req, reply)
}

func (c *Context) AnswerToOrder(rw web.ResponseWriter, req *web.Request) {
	orderId := req.PathParams["id"]
	answer := req.PathParams["answer"]

	companyId, err := req.Cookie("companyId")
	if err != nil {
		c.Error = errors.Wrap(err, "parsing company id")
		rw.WriteHeader(http.StatusUnauthorized)
		return
	}

	isAccepted := false
	if answer == "accepted" {
		isAccepted = true
	} else if answer != "declined" {
		c.Error = errors.Wrap(errors.New("answer can be either \"accepted\" or \"declined\""), "got bad order answer")
		rw.WriteHeader(http.StatusBadRequest)
		return
	}

	var supplierId, buyerId string
	var dateAccepted, dateClosed sql.NullString
	err = db.QueryRow(`SELECT supplier_id, buyer_id, date_accepted, date_closed FROM orders WHERE id=$1`, orderId).Scan(&supplierId, &buyerId, &dateAccepted, &dateClosed)
	if err != nil {
		c.Error = errors.Wrap(err, "getting order info")
		rw.WriteHeader(http.StatusBadRequest)
		return
	}

	if supplierId != companyId.Value {
		c.Error = errors.Wrap(errors.New("it is not permissible to answer to other company's order"), "checking buyer's id")
		rw.WriteHeader(http.StatusForbidden)
		return
	}

	if dateClosed.String != "" { //(Alidar) May be use trigger?
		c.Error = errors.Wrap(errors.New("it is impossible to answer to alredy closed order"), "checking order's closeness-" + dateClosed.String+"-")
		rw.WriteHeader(http.StatusForbidden)
		return
	}

	if dateAccepted.String != "" {
		c.Error = errors.Wrap(errors.New("it is not permissible to answer to already accepted order"), "checking order's acceptance")
		rw.WriteHeader(http.StatusForbidden)
		return
	}

	if isAccepted {
		_, err = db.Exec(`UPDATE orders SET is_accepted=true, date_accepted=NOW() WHERE id=$1`, orderId)
		if err != nil {
			c.Error = errors.Wrap(err, "updating orders table")
			rw.WriteHeader(http.StatusInternalServerError)
			return
		}

		err = Notify(buyerId, "Your supplier accepted order")
	} else {
		_, err = db.Exec(`DELETE FROM order_items WHERE order_id=$1`, orderId)
		if err != nil {
			c.Error = errors.Wrap(err, "deleting ordert_items")
			rw.WriteHeader(http.StatusInternalServerError)
			return
		}

		_, err = db.Exec(`DELETE FROM orders WHERE id=$1`, orderId)
		if err != nil {
			c.Error = errors.Wrap(err, "deleting order")
			rw.WriteHeader(http.StatusInternalServerError)
			return
		}

		err = Notify(buyerId, "Your supplier declined order")
	}
	if err != nil {
		c.Error = errors.Wrap(err, "notificating")
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	reply := &ReplyModel {
		Res: &Response {
			Message: "success",
		},
	}
	rw.WriteHeader(http.StatusOK)
	c.Reply(rw, req, reply)

}

func (c *Context) CloseOrder(rw web.ResponseWriter, req *web.Request) {
	orderId := req.PathParams["id"]

	companyId, err := req.Cookie("companyId")
	if err != nil {
		c.Error = errors.Wrap(err, "parsing company id")
		rw.WriteHeader(http.StatusUnauthorized)
		return
	}

	var supplierId, buyerId string
	var dateAccepted, dateClosed sql.NullString
	err = db.QueryRow(`SELECT supplier_id, buyer_id, date_accepted, date_closed FROM orders WHERE id=$1`, orderId).Scan(&supplierId, &buyerId, &dateAccepted, &dateClosed)
	if err != nil {
		c.Error = errors.Wrap(err, "getting order info")
		rw.WriteHeader(http.StatusBadRequest)
		return
	}

	if buyerId != companyId.Value {
		c.Error = errors.Wrap(errors.New("it is not permissible to answer to other company's order"), "checking buyer's id")
		rw.WriteHeader(http.StatusForbidden)
		return
	}

	if dateClosed.String != "" {
		c.Error = errors.Wrap(errors.New("it is impossible to close a closed order again"), "checking order's closeness")
		rw.WriteHeader(http.StatusForbidden)
		return
	}

	if dateAccepted.String == "" {
		c.Error = errors.Wrap(errors.New("it is not permissible to close not accepted order"), "checking order's acceptance")
		rw.WriteHeader(http.StatusForbidden)
		return
	}

	_, err = db.Exec(`UPDATE orders SET is_closed=true, date_closed=NOW() WHERE id=$1`, orderId)
	if err != nil {
		c.Error = errors.Wrap(err, "updating orders table")
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}


	err = Notify(supplierId, "One of your buyers closed his order")
	if err != nil {
		c.Error = errors.Wrap(err, "notificating")
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}


	reply := &ReplyModel {
		Res: &Response {
			Message: "success",
		},
	}
	rw.WriteHeader(http.StatusOK)
	c.Reply(rw, req, reply)
}

func (c *Context) GetOrdersHistory (rw web.ResponseWriter, req *web.Request) {
	companyId, err := req.Cookie("companyId")
	if err != nil {
		c.Error = errors.Wrap(err, "parsing company id")
		rw.WriteHeader(http.StatusUnauthorized)
		return
	}


	isSupplier, err := req.Cookie("isSupplier")
	if err != nil {
		c.Error = errors.Wrap(err, "parsing isSupplier")
		rw.WriteHeader(http.StatusUnauthorized)
		return
	}

	var result *sql.Rows
	if isSupplier.Value == "true" {
		result, err = db.Query(`SELECT * FROM orders WHERE supplier_id=$1 and is_closed=true;`, companyId.Value)
	} else {
		result, err = db.Query(`SELECT * FROM orders WHERE buyer_id=$1 and is_closed=true;`, companyId.Value)
	}
	if err != nil {
		c.Error = errors.Wrap(err, "querying orders history")
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	var ordersHistory []Order
	companies := make(map[string]string)
	for result.Next() {
		order := new(Order)
		err = result.Scan(&order.Id, &order.SupplierId, &order.BuyerId, &order.DateOrdered, &order.Comment, &order.IsAccepted, &order.DateAccepted, &order.IsClosed, &order.DateClosed)
		if err != nil {
			c.Error = errors.Wrap(err, "scanning order")
			rw.WriteHeader(http.StatusInternalServerError)
			return
		}

		var companyName string
		_, ok := companies[order.SupplierId]
		if ok == false {
			err = db.QueryRow(`SELECT name FROM companies WHERE id = $1;`, order.SupplierId).Scan(&companyName)
			if err != nil {
				c.Error = errors.Wrap(err, "getting supplier's name")
				rw.WriteHeader(http.StatusInternalServerError)
				return
			}
			companies[order.SupplierId] = companyName
		}
		order.SupplierName = companyName

		_, ok = companies[order.BuyerId]
		if ok == false {
			err = db.QueryRow(`SELECT name FROM companies WHERE id = $1;`, order.BuyerId).Scan(&companyName)
			if err != nil {
				c.Error = errors.Wrap(err, "getting buyer's name")
				rw.WriteHeader(http.StatusInternalServerError)
				return
			}
			companies[order.BuyerId] = companyName
		}
		order.BuyerName = companyName

		ordersHistory = append(ordersHistory, *order)
	}

	if len(ordersHistory) == 0 {
		rw.WriteHeader(http.StatusNotFound)
	} else {
		rw.WriteHeader(http.StatusOK)
	}
	c.Reply(rw, req, ordersHistory)
}

func (c *Context) GetClients(rw web.ResponseWriter, req *web.Request) {
	companyId, err := req.Cookie("companyId")
	if err != nil {
		c.Error = errors.Wrap(err, "parsing company id")
		rw.WriteHeader(http.StatusUnauthorized)
		return
	}

	isSupplier, err := req.Cookie("isSupplier")
	if err != nil {
		c.Error = errors.Wrap(err, "parsing isSupplier")
		rw.WriteHeader(http.StatusUnauthorized)
		return
	}

	var result *sql.Rows
	if isSupplier.Value == "true" {
		result, err = db.Query(`SELECT id, name, description, website, email 
					FROM companies
					INNER JOIN (SELECT buyer_id 
						    FROM partners 
						    WHERE supplier_id=$1) as pt
					ON companies.id = pt.buyer_id;`, companyId.Value)
	} else {
		result, err = db.Query(`SELECT id, name, description, website, email 
					FROM companies
					INNER JOIN (SELECT supplier_id 
						    FROM partners 
						    WHERE buyer_id=$1) as pt
					ON companies.id = pt.supplier_id;`, companyId.Value)
	}
	if err != nil {
		c.Error = errors.Wrap(err, "querying clients")
		rw.WriteHeader(http.StatusBadRequest)
		return
	}

	var companies []Company
	for result.Next() {
		company := new(Company)
		err := result.Scan(&company.Id, &company.Name, &company.Description, &company.Website, &company.Email)
		if err != nil {
			c.Error = errors.Wrap(err, "scanning company")
			rw.WriteHeader(http.StatusInternalServerError)
			return
		}
		companies = append(companies, *company)

	}

	if len(companies) == 0 {
		rw.WriteHeader(http.StatusNotFound)
	} else {
		rw.WriteHeader(http.StatusOK)
	}
	c.Reply(rw, req, companies)

}

func (c *Context) FindClients(rw web.ResponseWriter, req *web.Request) {
	companyId, err := req.Cookie("companyId")
	if err != nil {
		c.Error = errors.Wrap(err, "parsing company id")
		rw.WriteHeader(http.StatusUnauthorized)
		return
	}

	isSupplier, err := req.Cookie("isSupplier")
	if err != nil {
		c.Error = errors.Wrap(err, "parsing isSupplier")
		rw.WriteHeader(http.StatusUnauthorized)
		return
	}

	var result *sql.Rows
	if isSupplier.Value == "true" {
		result, err = db.Query(`SELECT id, name, description, website, email
					FROM (SELECT * 
						FROM companies 
						WHERE is_supplier=false) as ct
					INNER JOIN (SELECT * 
						FROM partners 
						WHERE supplier_id = $1) as pt
					ON ct.id <> pt.buyer_id;`, companyId.Value)
	} else {
		result, err = db.Query(`SELECT id, name, description, website, email
					FROM (SELECT * 
						FROM companies 
						WHERE is_supplier=true) as ct
					INNER JOIN (SELECT * 
						FROM partners 
						WHERE buyer_id = $1) as pt
					ON ct.id <> pt.supplier_id;`, companyId.Value)
	}

	if err != nil {
		c.Error = errors.Wrap(err, "querying new clients")
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	var companies []Company
	for result.Next() {
		company := new(Company)
		err = result.Scan(&company.Id, &company.Name, &company.Description, &company.Website, &company.Email)
		if err != nil {
			c.Error = errors.Wrap(err, "scanning company")
			rw.WriteHeader(http.StatusInternalServerError)
			return
		}
		companies = append(companies, *company)

	}

	if len(companies) == 0 {
		rw.WriteHeader(http.StatusNotFound)
	} else {
		rw.WriteHeader(http.StatusOK)
	}
	c.Reply(rw, req, companies)

}
