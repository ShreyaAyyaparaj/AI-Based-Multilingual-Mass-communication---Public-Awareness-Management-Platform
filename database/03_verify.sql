USE communication_campaign;

SELECT COUNT(*) AS total_recipients FROM recipients;
SELECT a.name, COUNT(am.recipient_id) AS members
FROM audiences a LEFT JOIN audience_members am ON a.audience_id=am.audience_id
WHERE a.name='Karnataka Recipients'
GROUP BY a.audience_id, a.name;

SELECT c.name AS campaign, a.name AS audience
FROM campaigns c
JOIN campaign_audiences ca ON c.campaign_id=ca.campaign_id
JOIN audiences a ON ca.audience_id=a.audience_id
WHERE c.name='Dengue Awareness';

SELECT COUNT(*) AS total_templates FROM communication_templates;
SELECT template_type, COUNT(*) AS count_by_type
FROM communication_templates GROUP BY template_type ORDER BY template_type;
