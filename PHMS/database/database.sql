
-- PHMS DATABASE
-- PostgreSQL

CREATE TABLE IF NOT EXISTS pet_profile (
    pet_id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL,
    pet_name VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(100),
    gender VARCHAR(20),
    date_of_birth DATE,
    weight DECIMAL(6,2),
    allergies TEXT,
    description TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'DELETED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointment (
    appointment_id SERIAL PRIMARY KEY,
    pet_id INTEGER NOT NULL REFERENCES pet_profile(pet_id),
    appointment_date TIMESTAMP NOT NULL,
    reason TEXT,
    status VARCHAR(30) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medical_record (
    record_id SERIAL PRIMARY KEY,
    pet_id INTEGER NOT NULL REFERENCES pet_profile(pet_id),
    doctor_id INTEGER NOT NULL,
    diagnosis TEXT,
    treatment TEXT,
    notes TEXT,
    examination_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medication (
    medication_id SERIAL PRIMARY KEY,
    medication_name VARCHAR(150) NOT NULL,
    description TEXT,
    unit VARCHAR(50),
    price DECIMAL(10,2) DEFAULT 0,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prescription (
    prescription_id SERIAL PRIMARY KEY,
    pet_id INTEGER NOT NULL REFERENCES pet_profile(pet_id),
    doctor_id INTEGER NOT NULL,
    record_id INTEGER REFERENCES medical_record(record_id),
    diagnosis TEXT,
    instructions TEXT,
    status VARCHAR(20) DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'COMPLETED', 'SENT')),
    prescribed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prescription_item (
    item_id SERIAL PRIMARY KEY,
    prescription_id INTEGER NOT NULL
        REFERENCES prescription(prescription_id) ON DELETE CASCADE,
    medication_id INTEGER NOT NULL
        REFERENCES medication(medication_id),
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100),
    duration VARCHAR(100),
    quantity INTEGER NOT NULL,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_pet_owner
ON pet_profile(owner_id);

CREATE INDEX IF NOT EXISTS idx_pet_status
ON pet_profile(status);

CREATE INDEX IF NOT EXISTS idx_appointment_pet
ON appointment(pet_id);

CREATE INDEX IF NOT EXISTS idx_medical_record_pet
ON medical_record(pet_id);

CREATE INDEX IF NOT EXISTS idx_prescription_pet
ON prescription(pet_id);

CREATE INDEX IF NOT EXISTS idx_prescription_status
ON prescription(status);

CREATE INDEX IF NOT EXISTS idx_prescription_item
ON prescription_item(prescription_id);
