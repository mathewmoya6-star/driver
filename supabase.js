import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Course data from LEARNER Hub
const courses = [
    {
        title: 'Introduction to Driving',
        unit_number: 1,
        description: 'Motor vehicles are an important part of our day-to-day living and provide a means for people and goods to be transported from one location to another.',
        content: 'The goal of driver training is ensure that you, as the driver, are equipped with the right knowledge of how to handle your vehicle and how to act appropriately when using the road. Most traffic accidents are caused by human error, however this can be easily prevented when the driver is adequately prepared for the traffic situation.',
        type: 'free',
        price: 0,
        duration: '2 hours',
        level: 'Beginner'
    },
    {
        title: 'Fundamental Driving Rules',
        unit_number: 2,
        description: 'The road is governed by rules and regulations that ensure order is maintained on the roads at all times.',
        content: 'Rules derived from The Traffic Act and The Highway Code. Key rules include: Use of horn only when necessary, Give right-of-way to emergency vehicles (police, fire engines, ambulances), Respect pedestrian right of way, Follow all traffic signs and signals.',
        type: 'free',
        price: 0,
        duration: '3 hours',
        level: 'Beginner'
    },
    {
        title: 'Model Town',
        unit_number: 3,
        description: 'Understanding road networks through model town board simulation',
        content: 'Features include: One way traffic road (Dual Carriage Way) with white lines, Two way traffic road (Single Carriageway) with yellow center line, Roundabout with 4 lanes and clockwise movement, Parking zones (Angle and Flush parking), Yellow kerb indicating no parking/stopping, Pedestrian crossing, Stop and Give way signs.',
        type: 'free',
        price: 0,
        duration: '4 hours',
        level: 'Intermediate'
    },
    {
        title: 'Human Factors in Traffic',
        unit_number: 4,
        description: 'Understanding how human behavior affects road safety',
        content: 'Topics: Observation techniques, Health and safety requirements, Eyesight and vision standards, Fatigue management and prevention, Distractions (phones, radio, grooming), Effects of alcohol and drugs, Safety belt usage, Theft prevention, Road rage management.',
        type: 'free',
        price: 0,
        duration: '3 hours',
        level: 'Beginner'
    },
    {
        title: 'Vehicle Constructions and Controls',
        unit_number: 5,
        description: 'Learning about vehicle components and their functions',
        content: 'Components: Steering Wheel, Direction Indicator, Gear Lever, Hand Brake, Brake pedal, Accelerator, Clutch pedal, Rear-view Mirror, Side mirror, Speedometer, Temperature Gauge. Systems: Engine, Braking system, Steering system, Transmission system, Suspension system, Electrical system.',
        type: 'premium',
        price: 5000,
        duration: '5 hours',
        level: 'Beginner'
    },
    {
        title: 'Self-Inspection of Vehicle',
        unit_number: 6,
        description: 'Pre-journey vehicle inspection checklist',
        content: 'Exterior Inspection: Tyres (pressure, tread depth), Reflectors and lights, Mirrors, Windshield Wipers, Windows, Body condition, Cleanliness, Safety Belts, Emergency equipment, Paperwork. Interior Inspection: Brakes, Steering, Indicators, Transmission, Oil level, Coolant, Battery, Leaks.',
        type: 'free',
        price: 0,
        duration: '2 hours',
        level: 'Beginner'
    },
    {
        title: 'Observation',
        unit_number: 7,
        description: 'Mastering observation techniques for safe driving',
        content: 'Key concepts: Driver visibility (maximum distance to identify objects), Mirror usage (Rear view, exterior mirrors), Blind spot awareness (areas driver cannot directly observe), Nearside and offside mirrors, Proper mirror adjustment for optimal view, Hazard identification and anticipation.',
        type: 'free',
        price: 0,
        duration: '2 hours',
        level: 'Intermediate'
    },
    {
        title: 'Vehicle Control',
        unit_number: 8,
        description: 'Practical vehicle control techniques',
        content: 'Skills: Driving preparation (seat adjustment, mirror adjustment), Starting and stopping procedures, Using gears (1st to 5th gear), Steering techniques (10-to-2 position, push-pull method), Parking at kerb, Types of parking (Angle, Flush, Parallel), Turning (J-turns, U-turns), Driving on bends and hills, Reversing techniques.',
        type: 'premium',
        price: 7500,
        duration: '6 hours',
        level: 'Intermediate'
    },
    {
        title: 'Communication on the Road',
        unit_number: 9,
        description: 'Effective communication with other road users',
        content: 'Communication methods: MSM technique (Mirror, Signal, Manoeuvre), Hand signals by drivers (left turn, right turn, slowing down), Hand signals to traffic police, Light signals (indicators, brake lights, reverse lights), Traffic light signals (Red, Red+Amber, Green, Amber), Traffic signal blackout procedures.',
        type: 'free',
        price: 0,
        duration: '2 hours',
        level: 'Intermediate'
    },
    {
        title: 'Speed Management',
        unit_number: 10,
        description: 'Managing speed for safe driving',
        content: 'Key concepts: The 4 Second Rule (following distance), Braking Distance (distance to stop after braking), Thinking Distance (distance during reaction time), Stopping Distance (thinking + braking distance), Braking Systems (disc, drum, handbrakes), Freewheeling risks (reduced control), Progressive braking technique.',
        type: 'premium',
        price: 5000,
        duration: '3 hours',
        level: 'Advanced'
    },
    {
        title: 'Space Management',
        unit_number: 11,
        description: 'Managing space around your vehicle',
        content: 'Road conditions: Open Condition (clear broad view), Closed Conditions (limited space, restricted view), Changing Conditions (speed limits, road surface changes). Techniques: Maintain safe following distance, Space envelope management, Space recovery when insufficient space, Position to "See and be seen".',
        type: 'free',
        price: 0,
        duration: '2 hours',
        level: 'Intermediate'
    },
    {
        title: 'Emergency Manoeuvres',
        unit_number: 12,
        description: 'Handling emergency situations on the road',
        content: 'Emergency procedures: Evasive turns (J-turns, U-turns), Brake failure (pump brakes, apply parking brake), Tyre blowout (firm grip, no sudden braking, gradual slow down), Headlight failure at night, Defensive driving techniques, Emergency stopping procedures.',
        type: 'premium',
        price: 5000,
        duration: '3 hours',
        level: 'Advanced'
    },
    {
        title: 'Skid Control and Recovery',
        unit_number: 13,
        description: 'Managing and recovering from vehicle skids',
        content: 'Types of skids: Front Wheel Skid (vehicle goes off intended course), Rear Wheel Skid (rear swings out), Aquaplaning (tyres lose contact on wet roads). Recovery: Take feet off accelerator, Release and gently reapply brakes, Turn steering wheel in desired direction, Counter-steer as needed.',
        type: 'premium',
        price: 5000,
        duration: '2 hours',
        level: 'Advanced'
    },
    {
        title: 'Adverse Driving Conditions',
        unit_number: 14,
        description: 'Driving safely in difficult weather and road conditions',
        content: 'Adverse conditions: Night driving (slow down, don\'t over-drive headlights), Fog (use low beams, patient driving), Heavy rain (increase following distance, avoid puddles), Extreme weather (hot, dusty, windy), Reduced traction on wet roads, Emergency steering methods, ABS braking techniques (plant and steer).',
        type: 'premium',
        price: 7500,
        duration: '4 hours',
        level: 'Advanced'
    },
    {
        title: 'Preventive Maintenance',
        unit_number: 15,
        description: 'Regular vehicle maintenance and troubleshooting',
        content: 'Maintenance types: Vehicle inspection, Lubrication, Adjustment, Cleaning, Testing, Repair. Common issues: Tyre/Steering (puncture, heavy steering, vibrations), Brakes (incorrect adjustment, wear), Warning lights (low brake fluid, component failure), Lights (bulb failure, fuse failure), Engine (misfiring, starting issues, overheating).',
        type: 'free',
        price: 0,
        duration: '3 hours',
        level: 'Intermediate'
    },
    {
        title: 'Conditions of Carriage',
        unit_number: 16,
        description: 'Legal requirements for transporting goods and passengers',
        content: 'Conditions include: Customer rights and restrictions, Driver obligations to customers, Cargo handling requirements. For PSV vehicles: Statement of liability, Fare pricing, Exceptions, Code of conduct, Restricted items, Lost property procedures, Contact details.',
        type: 'free',
        price: 0,
        duration: '2 hours',
        level: 'Intermediate'
    },
    {
        title: 'Hazardous Materials',
        unit_number: 17,
        description: 'Safe handling and transport of dangerous goods',
        content: '9 Classes of hazardous materials: Explosives, Gases, Flammable Liquids, Flammable Solids, Oxidizing Substances, Toxic & Infectious Substances, Radioactive Material, Corrosives, Miscellaneous Dangerous Goods. Requires special licensing from KBS, NEMA, and NTSA.',
        type: 'premium',
        price: 10000,
        duration: '4 hours',
        level: 'Advanced'
    },
    {
        title: 'Emergency Procedures',
        unit_number: 18,
        description: 'What to do in case of road accidents and emergencies',
        content: 'Steps at crash scene: Set reflector triangles (50m ahead and behind), Call emergency services, Move uninjured people to safety, Don\'t move injured unless immediate danger, Give First Aid using Dr. A.B.C (Danger, Response, Airway, Breathing, Circulation), Report accident to police.',
        type: 'free',
        price: 0,
        duration: '3 hours',
        level: 'Intermediate'
    },
    {
        title: 'Work Planning',
        unit_number: 19,
        description: 'Trip planning and time management for drivers',
        content: 'Planning factors: Distance to travel (co-driver for long trips), Time/Traffic conditions (avoid peak hours, night driving), Meal planning (familiar stops), Fatigue prevention (regular breaks, rest before journey), Adverse weather precautions, Legal limits (max 8 hours driving in 24 hours), Trip records.',
        type: 'free',
        price: 0,
        duration: '2 hours',
        level: 'Beginner'
    },
    {
        title: 'Customer Care',
        unit_number: 20,
        description: 'Professional conduct and customer service for drivers',
        content: 'Essential skills: Communication skills (patience, positive attitude, appropriate language), Handling customer expectations, Special needs customers, Sexual harassment prevention, Anti-discrimination, Personal hygiene, Time management, Stress management, Defensive riding techniques.',
        type: 'free',
        price: 0,
        duration: '2 hours',
        level: 'Beginner'
    },
    {
        title: 'The Examination - 1000 Quiz Bank',
        unit_number: 21,
        description: 'Comprehensive exam preparation with 1000 practice questions',
        content: 'Exam registration procedure through NTSA. Prepare for both practical and theory exams. Arrive on time at examination centre. Complete quiz bank covering all 20 previous units plus traffic signs, model town illustrations, and regulations.',
        type: 'premium',
        price: 2000,
        duration: '10 hours',
        level: 'Advanced'
    }
];

// Traffic signs data
const trafficSigns = [
    { sign_name: 'Stop', sign_type: 'regulatory', meaning: 'Come to a complete stop', action_required: 'Stop completely at the line, look right, left, right, then proceed when safe' },
    { sign_name: 'Give Way/Yield', sign_type: 'regulatory', meaning: 'Yield to other traffic', action_required: 'Slow down, prepare to stop if necessary, give way to traffic on main road' },
    { sign_name: 'No Entry', sign_type: 'regulatory', meaning: 'Do not enter this road', action_required: 'Do not enter, find alternative route immediately' },
    { sign_name: 'Speed Limit', sign_type: 'regulatory', meaning: 'Maximum speed allowed', action_required: 'Do not exceed the indicated speed limit' },
    { sign_name: 'No Overtaking', sign_type: 'regulatory', meaning: 'Overtaking prohibited', action_required: 'Do not overtake other vehicles in this zone' },
    { sign_name: 'Pedestrian Crossing', sign_type: 'warning', meaning: 'Pedestrian crossing ahead', action_required: 'Slow down, be prepared to stop for pedestrians crossing' },
    { sign_name: 'Roundabout Ahead', sign_type: 'warning', meaning: 'Roundabout approaching', action_required: 'Reduce speed, prepare to give way to traffic from the right' },
    { sign_name: 'Bend Ahead', sign_type: 'warning', meaning: 'Sharp bend in road', action_required: 'Reduce speed before bend, stay in lane' },
    { sign_name: 'Road Narrowing', sign_type: 'warning', meaning: 'Road width decreases', action_required: 'Reduce speed, be prepared to give way to oncoming traffic' },
    { sign_name: 'Traffic Lights Ahead', sign_type: 'warning', meaning: 'Traffic signals ahead', action_required: 'Prepare to stop, reduce speed' }
];

// Driving rules from Highway Code
const drivingRules = [
    { rule_category: 'Horn Usage', rule_title: 'Use of Horn', rule_description: 'You may only use your car horn while your vehicle is moving and you need to warn other road users of your presence. Do not use horn aggressively or in no-hooting zones.', penalty: 'Fine up to KES 5,000' },
    { rule_category: 'Right of Way', rule_title: 'Emergency Vehicles', rule_description: 'Give right-of-way to police cars, fire engines, and ambulances sounding siren or with flashing lights, and presidential motorcade.', penalty: 'Fine up to KES 10,000' },
    { rule_category: 'Alcohol and Drugs', rule_title: 'Drunk Driving', rule_description: 'Do not drink and drive. Alcohol slows brain functions, affects judgment, reduces ability to judge speed/distance, and gives false confidence.', penalty: 'Fine up to KES 100,000 or imprisonment, license suspension' },
    { rule_category: 'Safety Belts', rule_title: 'Seat Belt Usage', rule_description: 'All passengers must wear safety belts at all times regardless of distance. Children under 12 require appropriate child restraints or booster seats.', penalty: 'Fine up to KES 5,000 per person' },
    { rule_category: 'Mobile Phones', rule_title: 'Handheld Devices', rule_description: 'Using a cell phone, whether talking or texting, is prohibited while driving. Switch off or keep phones out of reach during journey.', penalty: 'Fine up to KES 10,000' },
    { rule_category: 'Speed Limits', rule_title: 'Speed Management', rule_description: 'Drive at reasonable speed within designated limits. Higher speed means shorter reaction time and more severe accidents.', penalty: 'Fine up to KES 20,000 depending on excess speed' },
    { rule_category: 'Fatigue', rule_title: 'Driver Fatigue', rule_description: 'Do not start journey when tired. Take regular breaks on long distances. Get quality sleep before driving.', penalty: 'Fine up to KES 10,000 for driving while fatigued' },
    { rule_category: 'Load Limits', rule_title: 'Maximum Load', rule_description: 'Do not carry more than legally allowed number of passengers or weight of goods. Category B vehicles: max 7 passengers, GVW up to 3,500kg.', penalty: 'Fine up to KES 20,000' },
    { rule_category: 'Pedestrians', rule_title: 'Pedestrian Right of Way', rule_description: 'Give special attention to vulnerable road users: children, elderly, persons with disabilities, and non-motorized transport users.', penalty: 'Fine up to KES 10,000' },
    { rule_category: 'Litter', rule_title: 'No Littering', rule_description: 'Do not discard litter on roads. Litter can be hazard to you and other road users.', penalty: 'Fine up to KES 5,000' }
];

// Model town features
const modelTownFeatures = [
    { feature_name: 'One Way Traffic Road', description: 'Road where all vehicles move in one direction (Dual Carriage Way)', rules: ['White continuous line = no changing lanes or overtaking', 'White broken/dotted line = overtaking allowed if safe', 'Yellow kerb = no parking, waiting, or stopping', 'Central reserve separates one-way traffic'] },
    { feature_name: 'Two Way Traffic Road', description: 'Road where vehicles move in opposite directions (Single Carriageway)', rules: ['Yellow continuous line = keep left, no overtaking', 'Yellow broken line = overtaking allowed if road clear', 'Keep left unless overtaking', 'Pedestrian crossings marked on road'] },
    { feature_name: 'Roundabout', description: 'Meeting point where more than two roads meet, facilitating vehicle movement without obstruction', rules: ['No stopping on roundabout', 'No changing lanes', 'No parking', 'No overtaking', 'No waiting', 'Keep left and move clockwise', 'Count lanes from outermost to innermost'] },
    { feature_name: 'Angle Parking', description: 'Controlled parking zone where vehicles flow in one direction with designated entrance and exit', rules: ['Strictly for small cars only', 'Park from the farthest end', 'Park by forward gear (direct)', 'Exit by reverse', 'Available in controlled parking zones'] },
    { feature_name: 'Flush Parking', description: 'Uncontrolled parking zone on left side of road with entry but no security', rules: ['All vehicle types except tractors/trailers allowed', 'Entry available but leave space for exit', 'Park from farthest end', 'Park by reverse', 'Exit by forward driving'] },
    { feature_name: 'Stop Sign', description: 'Red octagon with white letters at junctions joining two-way traffic roads', rules: ['Come to complete stop', 'Look right, left, and right again', 'Only proceed when road is clear', 'Positioned at junctions joining two-way traffic roads'] },
    { feature_name: 'Give Way Sign', description: 'Red triangle with apex facing downward, white border', rules: ['Slow down or stop if necessary', 'Only proceed when safe', 'Yield to traffic on main road'] }
];

// Quiz questions (sample from the material)
const quizQuestions = [
    { unit_number: 1, question: 'What is the main goal of driver training?', options: ['To pass the test quickly', 'To equip drivers with right knowledge and skills', 'To get a license', 'To drive fast'], correct_answer: 1, difficulty: 'easy' },
    { unit_number: 2, question: 'What documents contain Kenyan road rules and regulations?', options: ['The Constitution', 'The Traffic Act and Highway Code', 'The Penal Code', 'The Employment Act'], correct_answer: 1, difficulty: 'easy' },
    { unit_number: 2, question: 'When can you use your car horn?', options: ['When stationary', 'When you are angry at other drivers', 'While moving to warn other road users', 'Anytime you want'], correct_answer: 2, difficulty: 'easy' },
    { unit_number: 2, question: 'Which vehicles must you give right-of-way to?', options: ['Any vehicle behind you', 'Police cars and emergency vehicles with sirens', 'Slow moving vehicles', 'Vehicles from the left'], correct_answer: 1, difficulty: 'medium' },
    { unit_number: 3, question: 'What does a yellow continuous line on a two-way road mean?', options: ['You can overtake', 'Parking allowed', 'Keep left, no overtaking', 'Speed up'], correct_answer: 2, difficulty: 'medium' },
    { unit_number: 3, question: 'How many lanes are counted on a roundabout from outside to inside?', options: ['From inside to outside', 'From outside to inside (1 is outermost)', 'Lanes are not numbered', 'Only the innermost counts'], correct_answer: 1, difficulty: 'medium' },
    { unit_number: 3, question: 'What does a yellow kerb mean?', options: ['Parking allowed', 'Loading zone', 'No parking, no waiting, no stopping', 'Taxi pick-up point'], correct_answer: 2, difficulty: 'easy' },
    { unit_number: 4, question: 'What is fatigue?', options: ['Being excited', 'Extreme tiredness from mental/physical exertion', 'Being hungry', 'Being angry'], correct_answer: 1, difficulty: 'easy' },
    { unit_number: 4, question: 'What effect does alcohol have on driving?', options: ['Improves focus', 'Slows brain functions and affects judgment', 'Makes you drive faster', 'No effect'], correct_answer: 1, difficulty: 'easy' },
    { unit_number: 5, question: 'What is the function of the clutch pedal?', options: ['To increase speed', 'To change gears in manual vehicle', 'To stop the car', 'To steer'], correct_answer: 1, difficulty: 'easy' }
];

// Function to push data
async function pushDataToSupabase() {
    console.log('🚀 Starting to push LEARNER Hub data to Supabase...\n');
    
    try {
        // 1. Push courses
        console.log('📚 Pushing courses (21 units)...');
        for (const course of courses) {
            const { error } = await supabase
                .from('courses')
                .upsert(course, { onConflict: 'unit_number' });
            
            if (error) {
                console.error(`❌ Failed to push "${course.title}":`, error.message);
            } else {
                console.log(`✅ Pushed: Unit ${course.unit_number} - ${course.title}`);
            }
        }
        
        // 2. Push traffic signs
        console.log('\n🚦 Pushing traffic signs...');
        for (const sign of trafficSigns) {
            const { error } = await supabase
                .from('traffic_signs')
                .upsert(sign, { onConflict: 'sign_name' });
            
            if (error) {
                console.error(`❌ Failed to push "${sign.sign_name}":`, error.message);
            } else {
                console.log(`✅ Pushed: ${sign.sign_name} sign`);
            }
        }
        
        // 3. Push driving rules
        console.log('\n📋 Pushing driving rules...');
        for (const rule of drivingRules) {
            const { error } = await supabase
                .from('driving_rules')
                .upsert(rule, { onConflict: 'rule_title' });
            
            if (error) {
                console.error(`❌ Failed to push "${rule.rule_title}":`, error.message);
            } else {
                console.log(`✅ Pushed: ${rule.rule_title}`);
            }
        }
        
        // 4. Push model town features
        console.log('\n🏘️ Pushing model town features...');
        for (const feature of modelTownFeatures) {
            const { error } = await supabase
                .from('model_town_features')
                .upsert(feature, { onConflict: 'feature_name' });
            
            if (error) {
                console.error(`❌ Failed to push "${feature.feature_name}":`, error.message);
            } else {
                console.log(`✅ Pushed: ${feature.feature_name}`);
            }
        }
        
        // 5. Push quiz questions
        console.log('\n📝 Pushing quiz questions...');
        for (const question of quizQuestions) {
            const { error } = await supabase
                .from('quiz_questions')
                .insert(question);
            
            if (error) {
                console.error(`❌ Failed to push question:`, error.message);
            } else {
                console.log(`✅ Pushed: ${question.question.substring(0, 50)}...`);
            }
        }
        
        console.log('\n🎉 SUCCESS! All data pushed to Supabase!');
        console.log('\n📊 Summary:');
        console.log(`   - ${courses.length} courses/units`);
        console.log(`   - ${trafficSigns.length} traffic signs`);
        console.log(`   - ${drivingRules.length} driving rules`);
        console.log(`   - ${modelTownFeatures.length} model town features`);
        console.log(`   - ${quizQuestions.length} quiz questions`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the function
pushDataToSupabase();
