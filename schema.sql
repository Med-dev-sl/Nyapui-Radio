CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (name, description) VALUES
  ('Superadmin', 'Full system access'),
  ('Station Manager', 'Manages station operations and staff'),
  ('Admin', 'Administrative access to system'),
  ('Staff', 'Basic staff access');

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE guests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  position VARCHAR(255) DEFAULT '',
  institution VARCHAR(255) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE presenters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE facebook_lives (
  id INT AUTO_INCREMENT PRIMARY KEY,
  facebook_url VARCHAR(500) NOT NULL,
  topic TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE live_guests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  live_id INT NOT NULL,
  guest_id INT NOT NULL,
  FOREIGN KEY (live_id) REFERENCES facebook_lives(id) ON DELETE CASCADE,
  FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
);

CREATE TABLE live_presenters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  live_id INT NOT NULL,
  presenter_id INT NOT NULL,
  FOREIGN KEY (live_id) REFERENCES facebook_lives(id) ON DELETE CASCADE,
  FOREIGN KEY (presenter_id) REFERENCES presenters(id) ON DELETE CASCADE
);

CREATE TABLE live_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  live_id INT NOT NULL,
  session_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (live_id) REFERENCES facebook_lives(id) ON DELETE CASCADE
);

CREATE TABLE live_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  live_id INT NOT NULL,
  commenter_name VARCHAR(255) DEFAULT 'Anonymous',
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (live_id) REFERENCES facebook_lives(id) ON DELETE CASCADE
);

CREATE TABLE program_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  photo_url VARCHAR(500) DEFAULT '',
  scheduled_at DATETIME NOT NULL,
  topic TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE schedule_guests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  schedule_id INT NOT NULL,
  guest_id INT NOT NULL,
  FOREIGN KEY (schedule_id) REFERENCES program_schedules(id) ON DELETE CASCADE,
  FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
);

CREATE TABLE schedule_presenters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  schedule_id INT NOT NULL,
  presenter_id INT NOT NULL,
  FOREIGN KEY (schedule_id) REFERENCES program_schedules(id) ON DELETE CASCADE,
  FOREIGN KEY (presenter_id) REFERENCES presenters(id) ON DELETE CASCADE
);

CREATE TABLE schedule_reminders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  schedule_id INT NOT NULL,
  session_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (schedule_id) REFERENCES program_schedules(id) ON DELETE CASCADE
);
