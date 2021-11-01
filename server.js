
const mysql = require('mysql2')
const inquirer = require('inquirer'); 
const cTable = require('console.table'); 



// connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'parra2Parra',
  database: 'tracker_db'
});

connection.connect(err => {
  if (err) throw err;
 questions();
});



const questions = () => {
  inquirer.prompt ([
    {
      type: 'list',
      name: 'choices', 
      message: 'What would you like to do?',
      choices: ['View all departments', 
                'View all roles', 
                'View all employees', 
                'Add a department', 
                'Add a role', 
                'Add an employee', 
                'Update an employee role',
                'Exit']
    }
  ])
    .then((answers) => {
      const { choices } = answers; 

      if (choices === "View all departments") {
        viewAllDept();
      }

     else if (choices === "View all roles") {
        viewAllRoles();
      }

      else if (choices === "View all employees") {
        viewAllEmploy();
      }

     else if (choices === "Add a department") {
        addNewDept();
      }

     else if (choices === "Add a role") {
        addNewRole();
      }

     else if (choices === "Add an employee") {
        addNewEmploy();
      }

     else if (choices === "Update an employee role") {
        updateEmployee();
      }

     else if (choices === "Exit") {
        connection.end()
    };
  });
};

// function to show all departments 
viewAllDept = () => {
  
  const sql = `SELECT department.id AS id, department.name AS department FROM department`; 

  connection.promise().query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
   questions();
  });
};

// function to show all roles 
viewAllRoles = () => {
  

  const sql = `SELECT role.title, role.salary, department.name AS Department FROM employee INNER JOIN role on role.id = employee.role_id INNER JOIN department on department.id = role.department_id`;
  
  connection.promise().query(sql, (err, rows) => {
    if (err) throw err; 
    console.table(rows); 
   questions();
  })
};

// function to show all employees 
viewAllEmploy = () => {
  console.log('Showing all employees...\n'); 
  const sql = `SELECT employee.id, 
                      employee.first_name, 
                      employee.last_name, 
                      role.title, 
                      department.name AS department,
                      role.salary, 
                      CONCAT (manager.first_name, " ", manager.last_name) AS manager
               FROM employee
                      LEFT JOIN role ON employee.role_id = role.id
                      LEFT JOIN department ON role.department_id = department.id
                      LEFT JOIN employee manager ON employee.manager_id = manager.id`;

  connection.promise().query(sql, (err, rows) => {
    if (err) throw err; 
    console.table(rows);
   questions();
  });
};

// function to add a department 
addNewDept = () => {
  inquirer.prompt([
    {
      type: 'input', 
      name: 'addDept',
      message: "What is the name of your new Department?",
      validate: addDept => {
        if (addDept) {
            return true;
        } else {
            console.log('Please enter a department');
            return false;
        }
      }
    }
  ])
    .then(answer => {
      const sql = `INSERT INTO department (name)
                  VALUES (?)`;
      connection.query(sql, answer.addDept, (err, result) => {
        if (err) throw err;
        console.log('Added ' + answer.addDept + " to departments!"); 

        viewAllDept();
    });
  });
};

// function to add a role 
addNewRole = () => {
  inquirer.prompt([
    {
      type: 'input', 
      name: 'role',
      message: "What is the role you'd like to add?",
      validate: input => {
        if (input) {
            return true;
        } else {
            console.log('Please, provide a role name');
            return false;
        }
      }
    },
    {
      type: 'input', 
      name: 'salary',
      message: "What would be the salary for this role?",
      
    }
  ])
    .then(answer => {
      const params = [answer.role, answer.salary];

      
      const roleSql = `SELECT name, id FROM department`; 

      connection.promise().query(roleSql, (err, data) => {
        if (err) throw err; 
    
        const dept = data.map(({ name, id }) => ({ name: name, value: id }));

        inquirer.prompt([
        {
          type: 'list', 
          name: 'dept',
          message: "What department will this role belong to?",
          choices: dept
        }
        ])
          .then(answer => {
            const dept = answer.dept;
            params.push(dept);

            const sql = `INSERT INTO role (title, salary, department_id)
                        VALUES (?, ?, ?)`;

            connection.query(sql, params, (err, result) => {
              if (err) throw err;
              console.log( answer.role + "has been added"); 

              viewAllRoles();
       });
     });
   });
 });
};


addNewEmploy = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'fistName',
      message: "What is the first name of your employee?",
      validate: input => {
        if (input) {
            return true;
        } else {
            console.log('Please, provide a name');
            return false;
        }
      }
    },
    {
      type: 'input',
      name: 'lastName',
      message: "What is the last name of your employee?",
      validate: input => {
        if (input) {
            return true;
        } else {
            console.log('Please, provide last name');
            return false;
        }
      }
    }
  ])
    .then(answer => {
    const params = [answer.fistName, answer.lastName]

    // grab roles from roles table
    const sql = `SELECT role.id, role.title FROM role`;
  
    connection.promise().query(sql, (err, data) => {
      if (err) throw err; 
      
      const roles = data.map(({ id, title }) => ({ name: title, value: id }));

      inquirer.prompt([
            {
              type: 'list',
              name: 'role',
              message: "What would be your employee's role?",
              choices: roles
            }
          ])
            .then(answer => {
              const role = answer.role;
              params.push(role);

              const managerSql = `SELECT * FROM employee`;

              connection.promise().query(managerSql, (err, data) => {
                if (err) throw err;

                const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));

                // console.log(managers);

                inquirer.prompt([
                  {
                    type: 'list',
                    name: 'manager',
                    message: "Who is the employee's manager?",
                    choices: managers
                  }
                ])
                  .then(answer => {
                    const manager = answer.manager;
                    params.push(manager);

                    const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                    VALUES (?, ?, ?, ?)`;

                    connection.query(sql, params, (err, result) => {
                    if (err) throw err;
                    console.log("Success a new Employee has been added!")

                    viewAllEmploy();
              });
            });
          });
        });
     });
  });
};

// function to update an employee 
updateEmployee = () => {
  
  const sql = `SELECT * FROM employee`;

  connection.promise().query(sql, (err, data) => {
    if (err) throw err; 

  const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));

    inquirer.prompt([
      {
        type: 'list',
        name: 'name',
        message: "Which employee would you like to update?",
        choices: employees
      }
    ])
      .then(answer => {
        const employee = answer.name;
        const params = []; 
        params.push(employee);

        const sql = `SELECT * FROM role`;

        connection.promise().query(sql, (err, data) => {
          if (err) throw err; 

          const roles = data.map(({ id, title }) => ({ name: title, value: id }));
          
            inquirer.prompt([
              {
                type: 'list',
                name: 'role',
                message: "What would be the new role of your employee?",
                choices: roles
              }
            ])
                .then(res => {
                const role = res.role;
                params.push(role); 
                
                let employee = params[0]
                params[0] = role
                params[1] = employee 
                

               

                const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;

                connection.query(sql, params, (err, result) => {
                  if (err) throw err;
                console.log("Success, Your employee has been updated!");
              
                viewAllEmploy();
          });
        });
      });
    });
  });
};












