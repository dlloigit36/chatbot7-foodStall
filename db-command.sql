-- create database
CREATE DATABASE foodstall
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LOCALE_PROVIDER = 'libc'
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

-- create tables
CREATE TABLE agent_detail (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100),
    profile VARCHAR(10),
    first_name VARCHAR(100),
    last_name VARCHAR(100)
)

INSERT INTO agent_detail (email, password, profile, first_name, last_name)
    VALUES ('james@simapps.net', '$2b$10$9YajyCgClbL9ztlo/XnlTuwub4p/ikoaSRcIiumXCdgK6ohAb2P7q', 'admin', 'james', 'bond')

CREATE TABLE fs_detail (
    id SERIAL PRIMARY KEY,
    code VARCHAR(70) UNIQUE,
    name VARCHAR(150),
    operation_b BOOLEAN,
    agent_id INTEGER REFERENCES agent_detail(id)
)

INSERT INTO fs_detail (code, name, operation_b, agent_id) 
    VALUES ('myslpjss2n001', 'Huat-Huat Noodles', 'true', 1)

INSERT INTO fs_detail (code, name, operation_b, agent_id) 
    VALUES ('myslpjss2c001', 'Nice Kuay Tiau', 'true', 1)

CREATE TABLE user_detail (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100),
    fs_id INTEGER REFERENCES fs_detail(id)
)

INSERT INTO user_detail (username, password, fs_id)
    VALUES ('huat1', '$2b$10$9YajyCgClbL9ztlo/XnlTuwub4p/ikoaSRcIiumXCdgK6ohAb2P7q', 1)

INSERT INTO user_detail (username, password, fs_id)
    VALUES ('nice1', '$2b$10$9YajyCgClbL9ztlo/XnlTuwub4p/ikoaSRcIiumXCdgK6ohAb2P7q', 2)

-- query sample
-- sample join table
SELECT username, password, code, name, operation_b
FROM user_detail
JOIN fs_detail
ON fs_id = fs_detail.id
WHERE username = 'huat1'

-- create table wait_number, smallint range -32768 to +32767
CREATE TABLE wait_number (
    id BIGSERIAL PRIMARY KEY,
    number SMALLINT,
    tel VARCHAR(20),
    fs_code VARCHAR(70) REFERENCES fs_detail(code),
    call_count SMALLINT,
    last_call_d TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    collected_b BOOLEAN DEFAULT False
)

INSERT INTO wait_number (number, tel, fs_code, call_count, created_at)
    VALUES (1001, '0122671773', 'myslpjss2n001', 0, '2024-10-24T04:33:02.124Z')

INSERT INTO wait_number (number, tel, fs_code, call_count, created_at)
    VALUES (1002, '0122671722', 'myslpjss2n001', 0, '2024-10-24T05:13:02.124Z')

INSERT INTO wait_number (number, tel, fs_code, call_count, created_at)
    VALUES (1001, '0162927722', 'myslpjss2c001', 0, '2024-10-24T05:44:02.124Z')

INSERT INTO wait_number (number, tel, fs_code, call_count, created_at)
    VALUES (1002, '0173457722', 'myslpjss2c001', 0, '2024-10-24T06:44:02.124Z')
