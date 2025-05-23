"use strict";
var app = null;

function StakingSchemaPagePresenter(){ 
    app = this;
}

StakingSchemaPagePresenter.prototype.Request = function(req,res,next){
	res.locals.title = `${res.locals.chainName} staking schema`;
    res.locals.metaDescription = `${res.locals.chainName} staking schema.`;
	res.locals.css_file = "chain";
	res.locals.page_hbs = "stakingschema";
	res.locals.layout_hbs = "amp";
	next();
};

module.exports = StakingSchemaPagePresenter;