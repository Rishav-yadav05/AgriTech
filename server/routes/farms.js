module.exports = require('../utils/crud')(require('../models/Farm'), { fields: ['name', 'village', 'lat', 'lon', 'areaAcres', 'soilType'] });
