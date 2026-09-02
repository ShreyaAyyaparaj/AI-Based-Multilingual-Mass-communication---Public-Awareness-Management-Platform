USE communication_campaign;

INSERT INTO admins (full_name, email, password_hash)
VALUES ('System Admin', 'admin@communication.com', SHA2('Admin@123', 256))
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

INSERT IGNORE INTO audiences (name, description)
VALUES ('Karnataka Recipients', 'All 100 milestone recipients from Karnataka');

INSERT IGNORE INTO campaigns (name, description, status)
VALUES ('Dengue Awareness', 'Dengue prevention awareness campaign for Karnataka recipients', 'DRAFT');

INSERT INTO recipients (recipient_id, first_name, last_name, email, phone, age, gender, state, district, city, language, occupation)
VALUES
(1,'Aarav','Sharma','aarav01@example.com','9000000001',25,'Male','Karnataka','Bengaluru Urban','Bengaluru','Kannada','Student'),
(2,'Ananya','Patel','ananya02@example.com','9000000002',28,'Female','Karnataka','Mysuru','Mysuru','Kannada','Teacher'),
(3,'Vikram','Rao','vikram03@example.com','9000000003',34,'Male','Karnataka','Belagavi','Belagavi','Kannada','Engineer'),
(4,'Sneha','Nair','sneha04@example.com','9000000004',30,'Female','Karnataka','Dakshina Kannada','Mangaluru','Kannada','Healthcare Worker'),
(5,'Rohan','Kumar','rohan05@example.com','9000000005',27,'Male','Karnataka','Bengaluru Urban','Bengaluru','English','Software Engineer'),
(6,'Pooja','Shetty','pooja06@example.com','9000000006',32,'Female','Karnataka','Udupi','Udupi','Kannada','Business Owner'),
(7,'Kiran','Gowda','kiran07@example.com','9000000007',29,'Male','Karnataka','Mandya','Mandya','Kannada','Farmer'),
(8,'Meera','Joshi','meera08@example.com','9000000008',26,'Female','Karnataka','Dharwad','Dharwad','Kannada','Student'),
(9,'Arjun','Desai','arjun09@example.com','9000000009',41,'Male','Karnataka','Hubballi','Hubballi','Kannada','Doctor'),
(10,'Divya','Reddy','divya10@example.com','9000000010',35,'Female','Karnataka','Ballari','Ballari','Kannada','Government Official');

INSERT INTO recipients (first_name,last_name,email,phone,age,gender,state,district,city,language,occupation)
SELECT CONCAT('User', n), CONCAT('Karnataka', n), CONCAT('recipient', n, '@example.com'), CONCAT('900000', LPAD(n,4,'0')), 18 + MOD(n, 40),
       CASE WHEN MOD(n,2)=0 THEN 'Female' ELSE 'Male' END,
       'Karnataka',
       CASE MOD(n,5) WHEN 0 THEN 'Bengaluru Urban' WHEN 1 THEN 'Mysuru' WHEN 2 THEN 'Belagavi' WHEN 3 THEN 'Udupi' ELSE 'Dharwad' END,
       CASE MOD(n,5) WHEN 0 THEN 'Bengaluru' WHEN 1 THEN 'Mysuru' WHEN 2 THEN 'Belagavi' WHEN 3 THEN 'Udupi' ELSE 'Dharwad' END,
       CASE MOD(n,4) WHEN 0 THEN 'English' WHEN 1 THEN 'Kannada' WHEN 2 THEN 'Hindi' ELSE 'Kannada' END,
       CASE MOD(n,5) WHEN 0 THEN 'Teacher' WHEN 1 THEN 'Student' WHEN 2 THEN 'Healthcare Worker' WHEN 3 THEN 'Farmer' ELSE 'Engineer' END
FROM (
  SELECT a.n + b.n*10 + 1 AS n
  FROM (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) a
  CROSS JOIN (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) b
) nums
WHERE n BETWEEN 11 AND 100;

INSERT IGNORE INTO audience_members (audience_id, recipient_id)
SELECT a.audience_id, r.recipient_id
FROM audiences a CROSS JOIN recipients r
WHERE a.name = 'Karnataka Recipients';

INSERT IGNORE INTO campaign_audiences (campaign_id, audience_id)
SELECT c.campaign_id, a.audience_id
FROM campaigns c CROSS JOIN audiences a
WHERE c.name='Dengue Awareness' AND a.name='Karnataka Recipients';

INSERT INTO communication_templates (title, template_type, channel, content) VALUES
('Dengue Prevention Awareness','Awareness','SMS','Prevent dengue by removing stagnant water around your home. Stay safe this monsoon.'),
('Clean Your Surroundings','Awareness','SMS','Keep your surroundings clean and dry. Do not allow water to collect in open containers.'),
('Dengue Health Tips','Awareness','SMS','Use mosquito repellents, wear protective clothing and keep water containers covered.'),
('Health Education Reminder','Education','SMS','Learn the early signs of dengue and seek medical advice for persistent fever or severe symptoms.'),
('School Dengue Awareness','Education','SMS','Students and parents: prevent mosquito breeding by keeping school and home surroundings clean.'),
('Community Health Education','Education','SMS','Share dengue prevention tips with your family and community to help reduce mosquito breeding.'),
('Urgent Dengue Alert','Emergency','SMS','URGENT: Dengue cases may rise during monsoon. Remove stagnant water and follow local health advisories.'),
('Fever Alert','Emergency','SMS','EMERGENCY NOTICE: Seek medical attention if high fever, severe headache or warning signs continue.'),
('Mosquito Breeding Alert','Emergency','SMS','ALERT: Check coolers, tanks and containers for standing water and eliminate breeding spots today.'),
('Weekly Prevention Reminder','Reminder','SMS','Reminder: Empty and clean water-holding containers every week to prevent mosquito breeding.'),
('Repellent Reminder','Reminder','SMS','Reminder: Use mosquito repellent and protective clothing, especially during peak mosquito activity.'),
('Health Check Reminder','Reminder','SMS','Reminder: If fever persists, contact a healthcare professional instead of self-medicating.'),
('General Public Message','General','SMS','Public awareness message: keep your home and neighborhood clean and support dengue prevention efforts.'),
('Community Support Message','General','SMS','Every household can help prevent dengue. Remove stagnant water and encourage your neighbors to do the same.'),
('Monsoon Safety Message','General','SMS','Monsoon safety: cover water containers, clear drains and report mosquito breeding areas.'),
('Dengue Campaign Welcome','General','SMS','Welcome to the Dengue Awareness campaign. Follow verified health guidance and stay informed.'),
('Protection Tips','Awareness','SMS','Protect your family: use screens or nets, avoid stagnant water and follow public health advice.'),
('Final Awareness Note','Education','SMS','Together we can reduce dengue. Practice prevention daily and share reliable health information.');
