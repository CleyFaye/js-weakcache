const {readFileSync} = require("fs");
const loadGruntTasks = require("load-grunt-tasks");

const licenseJS = [
  "/**",
  " * @license",
  " * @preserve",
  ...readFileSync("LICENSE", "utf8").split("\n")
    .map(c => ` * ${c}`.trimEnd()),
  " */",
].join("\n");

module.exports = grunt => {
  loadGruntTasks(grunt);

  grunt.initConfig({
    clean: {
      lib: ["lib"],
      cache: [
        ".tsbuildinfo",
        "**/.cache",
      ],
    },
    run: {
      "tsx": {
        cmd: "npx",
        args: [
          "tsc",
          "-p",
          "tsconfig_build.json",
        ],
      },
    },
    usebanner: {
      options: {banner: licenseJS},
      lib: {
        files: [{
          expand: true,
          cwd: "lib",
          src: ["**/*.js"],
        }],
      },
    },
  });

  grunt.registerTask(
    "build",
    "Build the library",
    [
      "run:tsx",
      "usebanner:lib",
    ],
  );

  grunt.registerTask("default", "build");
};
