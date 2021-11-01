INSERT INTO department (name)
VALUES 
('IT'),
('Finance & Accounting'),
('Sales & Marketing'),
('Executive');

INSERT INTO role (title, salary, department_id)
VALUES
('Lead Engineer', 80000, 1),
('Software Engineer', 120000, 1),
('Sales Lead', 10000, 3), 
('Salesperson', 150000, 3),
('Legal Team Lead', 70000, 4), 
('Lawyer', 90000, 4),
('Accountant', 100000, 2),
('CEO', 100000, 4);


INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
('Pete', 'Smith', 2, null),
('Mike', 'Stevens', 1, 1),
('Marc', 'Pence', 4, null),
('John', 'Doe', 3, 3),
('Michael', 'Smith', 6, null),
('Mae', 'Terrance', 5, 5),
('Jake', 'Jones', 7, null),
('Isabella', 'Hernandez', 8, 7);


