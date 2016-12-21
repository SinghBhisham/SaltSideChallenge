var express = require('express');
var router = express.Router();
var api = require('../lib/api');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index');
});


/*
* Task 1:
* Make models alphabetically sortable (descending, descending, default)
*/

function sortModels(models , descending){
    models = models || [];
    models.sort(function(a,b){
        if(descending){
            return a < b;
        }
        return b < a;
    });
    return Promise.resolve(models);
}

router.get('/models', function(req, res, next) {
	// use api to get models and render output
    var modelsP = api.fetchModels();
    var descending = req.query.descending;
    modelsP
        .then(function(models){
            return sortModels(models, descending);
        })
        .then(function(models){
            res.render('models', {models: models, descending: descending});
        })
        .catch(function(err){
            res.render('error', {error: err});
        });
});

/*
* Task 2:
* Make services filterable by type (repair, maintenance, cosmetic)
*/
function filterServices(services, filterBy){
    services = services || {};
    if(filterBy && filterBy!== "none"){
        services = services.filter(function(obj){
            return obj.type === filterBy;
        });
    }
    return Promise.resolve(services);
}
router.get('/services', function(req, res, next) {
    // use api to get services and render output
    var servicesP = api.fetchServices();
    var filterBy = req.query.filterBy || "none";
    servicesP
        .then(function(services){
            return filterServices(services, filterBy);
        })
        .then(function(services){
            res.render('services', {services: services});
        })
        .catch(function(err){
            res.render('error', {error: err});
        });
});

/*
* Task 3:
* Bugfix: Something prevents reviews from being rendered
* Make reviews searchable (content and source)
*/
function searchInReviews(reviews, query){
    query = query || "";
    reviews = reviews || [];
    var regex = new RegExp(query,'i');
    reviews = reviews.filter(function(rev){
        return rev.content.match(regex) || rev.source.match(regex);
    });
    return reviews;
}

router.get('/reviews', function(req, res, next) {
    var query = req.query.q || "";
	return Promise.all([api.fetchCustomerReviews(), api.fetchCorporateReviews()])
		.then(function(reviews) {
            if(reviews && reviews.length === 2){
                reviews = reviews[0].concat(reviews[1]);
            }
            else {
                reviews = [];
            }
            return reviews;
		})
        .then(function(reviews){
            return searchInReviews(reviews, query);
        })
        .then(function(reviews){
            res.render('reviews', {reviews: reviews, q: query});
        })
        .catch(function(err){
            res.render('error', {error: err});
        });
});

module.exports = router;
