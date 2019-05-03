package main

import(
	"net/http"
	"crypto/sha256"
	"encoding/json"
	"encoding/hex"

	"github.com/gocraft/web"
	"github.com/pkg/errors"
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

type PriceListEditForm struct {
	CompanyId	string	`json:"companyId"`
	Insert	[]PriceListEntry	`json:"insert,omitempty"`
	Update	[]PriceListEntry	`json:"update,omitempty"`
	Delete	[]PriceListEntry	`json:"delete,omitpemty"`
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
		c.Error = errors.Wrap(err, "register with bad company type")
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

	reply := &ReplyModel {
		PriceList: pricelist,
	}

	rw.WriteHeader(http.StatusOK)
	c.Reply(rw, req, reply)
}

func (c *Context) EditPricelist(rw web.ResponseWriter, req *web.Request) {
	var plef PriceListEditForm

	decoder := json.NewDecoder(req.Body)
	err := decoder.Decode(&plef)

	for _, i := range plef.Insert {
		_, err = db.Exec(`INSERT INTO pricelist (company_id, sku, name, units, price, category, description) VALUES ($1, $2, $3, $4, $5, $6, $7);`, plef.CompanyId, i.Sku, i.Name, i.Units, i.Price, i.Category, i.Description)
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
				  WHERE company_id=$7`, i.Sku, i.Name, i.Units, i.Price, i.Category, i.Description, plef.CompanyId)
		if err != nil {
			c.Error = errors.Wrap(err, "updating price item")
			rw.WriteHeader(http.StatusBadRequest)
			return
		}
	}


	for _, i := range plef.Delete {
		_, err = db.Exec(`DELETE FROM pricelist WHERE id=$1 and company_id=$2`, i.Id, plef.CompanyId)
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
