import random
import datetime
from ..models import DiseaseStatistics, Symptom

# Pre-generate the fixed diseases and symptoms
fixed_diseases = {
    'Blight': ['Yellowing Leaves', 'Wilting', 'Fungal Spots'],
    'Rust': ['Orange Pustules', 'Leaf Curling', 'Stem Lesions'],
    'Mosaic Virus': ['Leaf Mottling', 'Growth Stunting', 'Fruit Deformation'],
    'Wilt': ['Drooping Leaves', 'Stunted Growth', 'Browning'],
    'Powdery Mildew': ['White Powder on Leaves', 'Leaf Curling', 'Stem Weakening'],
    'Root Rot': ['Yellowing', 'Rotting Roots', 'Wilting'],
    'Anthracnose': ['Dark Spots on Fruit', 'Leaf Drop', 'Twigs Dieback'],
    'Scab': ['Raised Lesions', 'Fruit Cracking', 'Leaf Blight'],
    'Leaf Spot': ['Brown Spots', 'Yellowing', 'Premature Leaf Drop'],
    'Downy Mildew': ['Fuzzy Growth on Underside', 'Leaf Discoloration', 'Stunted Growth']
}

# Pre-generate symptoms in the database
def generate_fixed_symptoms():
    symptom_objects = {}
    for disease, symptoms in fixed_diseases.items():
        for symptom in symptoms:
            obj, created = Symptom.objects.get_or_create(name=symptom)
            symptom_objects[symptom] = obj
    return symptom_objects

# Generate Disease Statistics
def generate_disease_statistics(n=1000):
    fixed_symptoms = generate_fixed_symptoms()
    
    # Generating statistics for the past year
    base_date = datetime.datetime.now()
    disease_statistics = []
    
    for _ in range(n):
        # Random date within the past year
        random_days = random.randint(0, 365)
        reported_at = base_date - datetime.timedelta(days=random_days)
        
        # Randomly select a disease and corresponding symptoms
        disease_name = random.choice(list(fixed_diseases.keys()) + ['Unknown'])
        if disease_name == 'Unknown':
            num_symptoms = random.randint(1, 5)  # Variable number of symptoms for unknown disease
            symptoms = random.sample(list(fixed_symptoms.values()), num_symptoms)
        else:
            symptoms = [fixed_symptoms[symptom] for symptom in fixed_diseases[disease_name]]
        
        # Create a DiseaseStatistic object
        disease_statistic = DiseaseStatistics(
            disease=disease_name,
            region=f"Region {random.randint(1, 10)}",
            latitude=random.uniform(-90, 90),
            longitude=random.uniform(-180, 180),
            reported_at=reported_at
        )
        disease_statistic.save()
        
        # Add symptoms to the DiseaseStatistic
        disease_statistic.symptoms.set(symptoms)
        disease_statistics.append(disease_statistic)
    
    return disease_statistics

# Generate 1000 disease statistics
generate_fixed_symptoms()
#enerate_disease_statistics(1000)
