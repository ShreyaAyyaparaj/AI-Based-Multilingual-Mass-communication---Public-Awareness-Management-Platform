CREATE DATABASE IF NOT EXISTS communication_campaign;

USE communication_campaign;

CREATE TABLE IF NOT EXISTS admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recipients (
    recipient_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(60) NOT NULL,
    last_name VARCHAR(60) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(20),
    age INT,
    gender VARCHAR(30),
    state VARCHAR(80) NOT NULL,
    district VARCHAR(80),
    city VARCHAR(80),
    language VARCHAR(60),
    occupation VARCHAR(80),
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audiences (
    audience_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audience_members (
    audience_id INT NOT NULL,
    recipient_id INT NOT NULL,

    PRIMARY KEY (audience_id, recipient_id),

    CONSTRAINT fk_am_audience
        FOREIGN KEY (audience_id)
        REFERENCES audiences(audience_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_am_recipient
        FOREIGN KEY (recipient_id)
        REFERENCES recipients(recipient_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS campaigns (
    campaign_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(255),
    status ENUM('DRAFT', 'ACTIVE', 'COMPLETED') NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS campaign_audiences (
    campaign_id INT NOT NULL,
    audience_id INT NOT NULL,

    PRIMARY KEY (campaign_id, audience_id),

    CONSTRAINT fk_ca_campaign
        FOREIGN KEY (campaign_id)
        REFERENCES campaigns(campaign_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_ca_audience
        FOREIGN KEY (audience_id)
        REFERENCES audiences(audience_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS communication_templates (
    template_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    template_type ENUM(
        'Awareness',
        'Education',
        'Emergency',
        'Reminder',
        'General'
    ) NOT NULL,
    channel ENUM('SMS') NOT NULL DEFAULT 'SMS',
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);