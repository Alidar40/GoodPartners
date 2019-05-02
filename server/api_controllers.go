package main

import(
	"net/http"
	"crypto/sha256"
	"encoding/json"
	"encoding/hex"
	"strings"

	"github.com/gocraft/web"
	"github.com/pkg/errors"
)

type PriceListEntry struct {
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
	path := (strings.Split(req.RoutePath(), "/"))
	companyType := path[len(path) - 1]
	if companyType == "supplier" {
		isSupplier = true
	} else if companyType != "buyer" {
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
