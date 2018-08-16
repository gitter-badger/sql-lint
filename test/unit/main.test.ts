import { categorise, tokenise } from "../../src/lexer/lexer";
import { Select } from "../../src/lexer/select";
import { Use } from "../../src/lexer/use";
import { Line, putContentIntoLines, Query } from "../../src/reader/reader";

test("The framework is running", () => {
  expect(1).toEqual(1);
});

test.each([
  // SELECT statements
  ["SELECT * FROM person", "select"],

  // DELETE statements
  ["DELETE FROM person WHERE name = 'John.Doe'", "delete"],

  // UPDATE statements
  ["UPDATE person SET name = 'Joe.Reynolds'", "update"],

  // A statement with a trailing space
  ["   SELECT    * FROM person", "select"],

  // A statement with a lowercase keyword
  [" select * from person", "select"],
  ["USE symfony", "use"],
  ["use symfony;", "use"]
])("Queries are categorised correctly", (query, expected) => {
  const actual = categorise(query);
  expect(actual).toEqual(expected);
});

test.each([
  [
    "SELECT * FROM person;",

    
      {
        lines: [
          {
            content: "SELECT * FROM person;",
            num: 1,
            tokens: [
              ["keyword", "select"],
              ["table_reference", "*"],
              ["keyword", "from"],
              ["table_reference", "person;"]
            ]
          }
        ]
      }
    
  ],
  [
    "SELECT last_name FROM person;",

    {
      lines: [
        {
          content: "SELECT last_name FROM person;",
          num: 1,
          tokens: [
            ["keyword", "select"],
            ["table_reference", "last_name"],
            ["keyword", "from"],
            ["table_reference", "person;"]
          ]
        }
      ]
    }
  ],
  [
    "SELECT * FROM person WHERE name = 'test';",

    {
      lines: [
        {
          content: "SELECT * FROM person WHERE name = 'test';",
          num: 1,
          tokens: [
            ["keyword", "select"],
            ["table_reference", "*"],
            ["keyword", "from"],
            ["table_reference", "person"],
            ["keyword", "where"],
            ["???", "name"],
            ["???", "="],
            ["???", "'test';"]
          ]
        }
      ]
    }
  ]
])("It tokenises a select correctly", (query, expected) => {
  const tokeniser = new Select();
  const q = putContentIntoLines(query);
  const actual = tokeniser.tokenise(q[0]);
  expect(actual).toMatchObject(expected);
});

test.each([
  [
    "USE ;",
    {
      lines: [
        {
          content: "USE ;",
          num: 1,
          tokens: [["keyword", "use"], ["table_reference", ";"]]
        }
      ]
    }
  ],

  [
    "USE symfony ;",
    {
      lines: [
        {
          content: "USE symfony ;",
          num: 1,
          tokens: [
            ["keyword", "use"],
            ["table_reference", "symfony"],
            ["table_reference", ";"]
          ]
        }
      ]
    }
  ],

  [
    "use symfony pricing ;",
    {
      lines: [
        {
          content: "use symfony pricing ;",
          num: 1,
          tokens: [
            ["keyword", "use"],
            ["table_reference", "symfony"],
            ["table_reference", "pricing"],
            ["table_reference", ";"]
          ]
        }
      ]
    }
  ]
])("It tokenises a `use` correctly", (query, expected) => {
  const q = putContentIntoLines(query);
  const tokeniser = new Use();
  const actual = tokeniser.tokenise(q[0]);
  expect(actual).toEqual(expected);
});

test.each([
  [
    "symfony.gigs.venue",
    {
      database: "symfony",
      table: "gigs",
      column: "venue"
    }
  ],
  [
    "gigs",
    {
      table: "gigs"
    }
  ],
  [
    "symfony.gigs",
    {
      database: "symfony",
      table: "gigs"
    }
  ]
])("Table references are correctly categorised", (tableReference, expected) => {
  const tokeniser = new Select();
  const actual = tokeniser.extractTableReference(tableReference);
  expect(actual).toMatchObject(expected);
});

test("We correctly read a file", () => {
  const query = new Query();
  query.lines = [
    new Line("DELETE", 1),
    new Line(" FROM ", 2),
    new Line(" person WHERE ", 4),
    new Line(" age > 5;", 5)
  ];
  const expected: any = [query];

  const input = "DELETE\n FROM \n\n person WHERE \n age > 5;";
  const actual = putContentIntoLines(input);
  expect(actual).toEqual(expected);
});

test("We correctly reconstruct our query from lines", () => {
  const query = new Query();
  query.lines = [
    new Line("DELETE", 1),
    new Line(" FROM ", 2),
    new Line(" person WHERE ", 4),
    new Line(" age > 5;", 5)
  ];

  const expected: string = "DELETE FROM  person WHERE  age > 5;";
  const actual = query.getContent();
  expect(actual).toEqual(expected);
});


test.each([
  [
    "SELECT last_name FROM person;",
    {
      lines: [
        {
          content: "SELECT last_name FROM person;",
          num: 1,
          tokens: [
            ["keyword", "select"],
            ["table_reference", "last_name"],
            ["keyword", "from"],
            ["table_reference", "person;"]
          ]
        }
      ]
    }
  ],
])("It tokenises correctly when called through tokenise", (query, expected) => {
  const q = putContentIntoLines(query);
  const actual = tokenise(q[0]);
  expect(actual).toMatchObject(expected);
});