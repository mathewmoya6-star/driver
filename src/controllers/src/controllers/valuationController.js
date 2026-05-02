const { supabase } = require('../config/supabase');

// Complete vehicle makes and models database
const VEHICLE_DATABASE = {
    toyota: {
        basePrice: 1850000,
        models: ['Fortuner', 'Hilux', 'Land Cruiser Prado', 'Corolla', 'Camry', 'RAV4', 'Harrier', 'Voxy', 'Axio', 'Premio', 'Fielder', 'Passo', 'Vitz', 'Alphard', 'Hiace', 'Mark X', 'Crown', 'Supra', 'Yaris']
    },
    honda: {
        basePrice: 1450000,
        models: ['CR-V', 'Civic', 'Accord', 'HR-V', 'Fit', 'Odyssey', 'Pilot', 'Insight', 'Stepwgn', 'Freed', 'Vezel']
    },
    nissan: {
        basePrice: 1350000,
        models: ['X-Trail', 'Navara', 'Patrol', 'Sunny', 'Note', 'Qashqai', 'Juke', 'Leaf', 'Murano', 'Wingroad']
    },
    subaru: {
        basePrice: 1550000,
        models: ['Forester', 'Outback', 'Impreza', 'Legacy', 'WRX', 'XV Crosstrek', 'Levorg']
    },
    mitsubishi: {
        basePrice: 1250000,
        models: ['Pajero', 'Outlander', 'L200', 'ASX', 'Delica', 'Mirage', 'Lancer', 'Pajero Sport']
    },
    mazda: {
        basePrice: 1200000,
        models: ['CX-5', 'Demio', 'Axela', 'Atenza', 'CX-9', 'BT-50', 'MX-5', 'CX-3']
    },
    suzuki: {
        basePrice: 900000,
        models: ['Swift', 'Vitara', 'Jimny', 'Ciaz', 'Ertiga', 'Alto', 'Ignis', 'Baleno']
    },
    hyundai: {
        basePrice: 1150000,
        models: ['Tucson', 'Santa Fe', 'Elantra', 'Accent', 'i10', 'i20', 'Kona', 'Sonata', 'Palisade']
    },
    kia: {
        basePrice: 1100000,
        models: ['Sportage', 'Sorento', 'Picanto', 'Rio', 'Optima', 'Soul', 'Carnival', 'Telluride']
    },
    volkswagen: {
        basePrice: 1400000,
        models: ['Golf', 'Polo', 'Passat', 'Tiguan', 'Touareg', 'Jetta', 'Beetle', 'Amarok']
    },
    mercedes: {
        basePrice: 2500000,
        models: ['C-Class', 'E-Class', 'S-Class', 'GLE', 'GLC', 'GLA', 'A-Class', 'B-Class', 'G-Class']
    },
    bmw: {
        basePrice: 2300000,
        models: ['3 Series', '5 Series', '7 Series', 'X3', 'X5', 'X1', 'X7', '1 Series', '2 Series']
    },
    audi: {
        basePrice: 2200000,
        models: ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7', 'A1', 'A5', 'Q2', 'e-tron']
    },
    lexus: {
        basePrice: 2800000,
        models: ['RX', 'NX', 'ES', 'LX', 'GX', 'IS', 'LS', 'UX', 'RC']
    },
    range_rover: {
        basePrice: 3500000,
        models: ['Evoque', 'Sport', 'Vogue', 'Velar', 'Discovery', 'Defender']
    },
    ford: {
        basePrice: 1300000,
        models: ['Ranger', 'Everest', 'Focus', 'Fiesta', 'Mustang', 'Explorer', 'Kuga']
    }
};

// Color value multipliers
const COLOR_MULTIPLIERS = {
    white: 1.025,
    silver: 1.02,
    black: 1.035,
    grey: 1.01,
    blue: 1.0,
    red: 0.995,
    brown: 0.99,
    green: 0.985,
    matte_black: 1.04
};

// Condition multipliers
const CONDITION_MULTIPLIERS = {
    excellent: 1.15,
    very_good: 1.00,
    good: 0.92,
    fair: 0.85
};

// Accident history multipliers
const ACCIDENT_MULTIPLIERS = {
    none: 1.00,
    minor: 0.90,
    major: 0.75
};

// Transmission multipliers
const TRANSMISSION_MULTIPLIERS = {
    auto: 1.03,
    manual: 1.00,
    cvt: 1.01
};

// Drive type multipliers
const DRIVE_MULTIPLIERS = {
    '2wd': 1.00,
    '4wd': 1.055,
    'awd': 1.055
};

// Advanced valuation calculation engine
const calculateAdvancedValuation = (data) => {
    const {
        make, model, year, mileage, color, interior, engine_type,
        transmission, drive_type, light_type, condition, accident_history,
        owners_count, modification_details
    } = data;

    // Get base price for make
    const vehicleMake = VEHICLE_DATABASE[make?.toLowerCase()];
    let baseValue = vehicleMake?.basePrice || 1500000;
    
    // Model adjustment (some models hold value better)
    const modelAdjustment = {
        'Land Cruiser Prado': 1.15,
        'Fortuner': 1.10,
        'Hilux': 1.08,
        'Mercedes C-Class': 1.05,
        'BMW 3 Series': 1.04,
        'default': 1.00
    };
    const modelKey = `${make} ${model}`;
    const modelMultiplier = modelAdjustment[modelKey] || modelAdjustment.default;
    baseValue *= modelMultiplier;

    // Age and depreciation calculation
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    
    let depreciationRate;
    if (age === 0) depreciationRate = 0.96;
    else if (age === 1) depreciationRate = 0.85;
    else if (age === 2) depreciationRate = 0.78;
    else if (age === 3) depreciationRate = 0.72;
    else if (age === 4) depreciationRate = 0.66;
    else if (age === 5) depreciationRate = 0.60;
    else depreciationRate = Math.max(0.22, 0.60 - (age - 5) * 0.06);

    // Mileage impact (Kenyan roads are harder on cars)
    let mileageImpact;
    if (mileage <= 10000) mileageImpact = 1.04;
    else if (mileage <= 30000) mileageImpact = 0.99;
    else if (mileage <= 60000) mileageImpact = 0.97;
    else if (mileage <= 100000) mileageImpact = 0.92;
    else if (mileage <= 150000) mileageImpact = 0.82;
    else if (mileage <= 200000) mileageImpact = 0.72;
    else if (mileage <= 250000) mileageImpact = 0.62;
    else mileageImpact = 0.52;

    // Calculate factors
    const colorFactor = COLOR_MULTIPLIERS[color] || 1.0;
    const conditionFactor = CONDITION_MULTIPLIERS[condition] || 1.0;
    const accidentFactor = ACCIDENT_MULTIPLIERS[accident_history] || 1.0;
    const transmissionFactor = TRANSMISSION_MULTIPLIERS[transmission] || 1.0;
    const driveFactor = DRIVE_MULTIPLIERS[drive_type] || 1.0;
    
    // Owners count factor
    const ownersFactor = owners_count === 1 ? 1.03 : owners_count > 2 ? 0.95 : 1.0;
    
    // Light type factor
    const lightFactor = {
        halogen: 1.0,
        xenon: 1.015,
        led: 1.03,
        matrix: 1.05
    }[light_type] || 1.0;

    // Calculate final value
    let finalValue = baseValue * depreciationRate * mileageImpact * colorFactor * 
                     conditionFactor * accidentFactor * transmissionFactor * 
                     driveFactor * ownersFactor * lightFactor;

    // Apply modifications factor (aftermarket parts can affect value)
    const modificationsFactor = modification_details ? 0.95 : 1.0;
    finalValue *= modificationsFactor;

    // Calculate confidence score
    let confidenceScore = 75;
    if (age <= 3) confidenceScore += 8;
    if (mileage <= 50000) confidenceScore += 5;
    if (condition === 'excellent') confidenceScore += 7;
    if (accident_history === 'none') confidenceScore += 5;
    if (owners_count === 1) confidenceScore += 3;
    if (light_type === 'matrix') confidenceScore += 2;
    confidenceScore = Math.min(99, confidenceScore);

    // Calculate market adjustments (based on Kenyan market trends)
    const marketTrend = {
        toyota: 1.05,    // Toyota holds value best in Kenya
        subaru: 1.03,
        mercedes: 1.02,
        bmw: 1.01,
        default: 1.00
    };
    const marketFactor = marketTrend[make?.toLowerCase()] || marketTrend.default;
    finalValue *= marketFactor;

    return {
        estimatedValue: Math.round(finalValue),
        confidence: confidenceScore,
        minValue: Math.round(finalValue * 0.92),
        maxValue: Math.round(finalValue * 1.08),
        breakdown: {
            baseValue: baseValue,
            depreciation: Math.round(depreciationRate * 100),
            mileageImpact: Math.round(mileageImpact * 100),
            ageYears: age,
            conditionImpact: Math.round((conditionFactor - 1) * 100),
            accidentImpact: Math.round((accidentFactor - 1) * 100),
            marketAdjustment: Math.round((marketFactor - 1) * 100)
        },
        recommendations: generateRecommendations(condition, accident_history, mileage, age)
    };
};

// Generate maintenance recommendations
const generateRecommendations = (condition, accident_history, mileage, age) => {
    const recommendations = [];
    
    if (condition !== 'excellent') {
        recommendations.push('Schedule a professional inspection');
    }
    
    if (mileage > 100000) {
        recommendations.push('Consider major service including timing belt and water pump');
    }
    
    if (age > 5) {
        recommendations.push('Check suspension components and bushings');
    }
    
    if (accident_history !== 'none') {
        recommendations.push('Verify repair quality with certified mechanic');
        recommendations.push('Check for hidden damage in frame and suspension');
    }
    
    if (recommendations.length === 0) {
        recommendations.push('Well-maintained vehicle - keep up with regular service intervals');
    }
    
    return recommendations;
};

// Get vehicle makes list
const getMakes = async (req, res) => {
    try {
        const makes = Object.keys(VEHICLE_DATABASE).map(key => ({
            id: key,
            name: key.charAt(0).toUpperCase() + key.slice(1),
            basePrice: VEHICLE_DATABASE[key].basePrice
        }));
        res.json({ success: true, makes });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch makes' });
    }
};

// Get models for a specific make
const getModels = async (req, res) => {
    try {
        const { make } = req.params;
        const vehicleMake = VEHICLE_DATABASE[make?.toLowerCase()];
        
        if (!vehicleMake) {
            return res.status(404).json({ error: 'Make not found' });
        }
        
        res.json({ 
            success: true, 
            make: make,
            models: vehicleMake.models 
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch models' });
    }
};

// Create new valuation
const createValuation = async (req, res) => {
    try {
        const valuationData = req.body;
        const result = calculateAdvancedValuation(valuationData);
        
        // Validate required fields
        const requiredFields = ['make', 'model', 'year', 'mileage'];
        const missingFields = requiredFields.filter(field => !valuationData[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                error: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }
        
        // Save to database
        const { data, error } = await supabase
            .from('valuations')
            .insert([{
                user_id: req.user.id,
                make: valuationData.make.toLowerCase(),
                model: valuationData.model,
                year: valuationData.year,
                mileage: valuationData.mileage,
                color: valuationData.color,
                interior: valuationData.interior,
                engine_type: valuationData.engine_type,
                transmission: valuationData.transmission,
                drive_type: valuationData.drive_type,
                light_type: valuationData.light_type,
                condition: valuationData.condition,
                accident_history: valuationData.accident_history,
                owners_count: valuationData.owners_count || 1,
                estimated_value: result.estimatedValue,
                confidence_score: result.confidence,
                min_value: result.minValue,
                max_value: result.maxValue,
                created_at: new Date()
            }])
            .select()
            .single();
        
        if (error) throw error;
        
        // Update user's valuation count in analytics
        await supabase.rpc('increment_valuation_count', { user_id: req.user.id });
        
        res.json({
            success: true,
            valuation: {
                id: data.id,
                estimatedValue: result.estimatedValue,
                confidence: result.confidence,
                priceRange: {
                    min: result.minValue,
                    max: result.maxValue
                },
                breakdown: result.breakdown,
                recommendations: result.recommendations
            },
            saved: true
        });
        
    } catch (error) {
        console.error('Valuation error:', error);
        res.status(500).json({ error: 'Failed to calculate valuation' });
    }
};

// Get valuation history
const getValuationHistory = async (req, res) => {
    try {
        const { limit = 20, offset = 0 } = req.query;
        
        const { data, error, count } = await supabase
            .from('valuations')
            .select('*', { count: 'exact' })
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        
        if (error) throw error;
        
        res.json({
            success: true,
            valuations: data,
            pagination: {
                total: count,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        console.error('History error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};

// Get single valuation details
const getValuationById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const { data, error } = await supabase
            .from('valuations')
            .select('*')
            .eq('id', id)
            .eq('user_id', req.user.id)
            .single();
        
        if (error) throw error;
        
        if (!data) {
            return res.status(404).json({ error: 'Valuation not found' });
        }
        
        res.json({ success: true, valuation: data });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch valuation' });
    }
};

// Compare two valuations
const compareValuations = async (req, res) => {
    try {
        const { valuationId1, valuationId2 } = req.params;
        
        const { data: v1, error: e1 } = await supabase
            .from('valuations')
            .select('*')
            .eq('id', valuationId1)
            .eq('user_id', req.user.id)
            .single();
            
        const { data: v2, error: e2 } = await supabase
            .from('valuations')
            .select('*')
            .eq('id', valuationId2)
            .eq('user_id', req.user.id)
            .single();
        
        if (e1 || e2) {
            return res.status(404).json({ error: 'One or both valuations not found' });
        }
        
        const comparison = {
            vehicle1: {
                make: v1.make,
                model: v1.model,
                year: v1.year,
                mileage: v1.mileage,
                value: v1.estimated_value
            },
            vehicle2: {
                make: v2.make,
                model: v2.model,
                year: v2.year,
                mileage: v2.mileage,
                value: v2.estimated_value
            },
            difference: Math.abs(v1.estimated_value - v2.estimated_value),
            percentageDifference: ((Math.abs(v1.estimated_value - v2.estimated_value) / Math.max(v1.estimated_value, v2.estimated_value)) * 100).toFixed(2)
        };
        
        res.json({ success: true, comparison });
    } catch (error) {
        res.status(500).json({ error: 'Failed to compare valuations' });
    }
};

// Market insights (average prices by make)
const getMarketInsights = async (req, res) => {
    try {
        const { make } = req.query;
        
        let query = supabase
            .from('valuations')
            .select('make, model, year, estimated_value')
            .eq('make', make?.toLowerCase());
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Calculate averages
        const averages = {};
        data.forEach(v => {
            if (!averages[v.model]) {
                averages[v.model] = { total: 0, count: 0, years: [] };
            }
            averages[v.model].total += v.estimated_value;
            averages[v.model].count++;
            averages[v.model].years.push(v.year);
        });
        
        const insights = Object.keys(averages).map(model => ({
            model,
            averagePrice: Math.round(averages[model].total / averages[model].count),
            sampleSize: averages[model].count,
            yearRange: {
                min: Math.min(...averages[model].years),
                max: Math.max(...averages[model].years)
            }
        }));
        
        res.json({ success: true, insights });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch market insights' });
    }
};

module.exports = { 
    getMakes,
    getModels,
    createValuation, 
    getValuationHistory,
    getValuationById,
    compareValuations,
    getMarketInsights
};
