import nx from "@nx/eslint-plugin";

export default [
    ...nx.configs["flat/base"],
    ...nx.configs["flat/typescript"],
    ...nx.configs["flat/javascript"],
    {
      "ignores": [
        "**/dist",
        "**/out-tsc",
        "**/vitest.config.*.timestamp*",
        "**/test-output/**",
        "**/coverage/**",
        "**/src/gen/**"
      ]
    },
    {
        files: [
            "**/*.ts",
            "**/*.tsx",
            "**/*.js",
            "**/*.jsx"
        ],
        rules: {
            "@nx/enforce-module-boundaries": [
                "error",
                {
                    enforceBuildableLibDependency: true,
                    allow: [
                        "^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$"
                    ],
                    depConstraints: [
                        {
                            sourceTag: "scope:utils",
                            onlyDependOnLibsWithTags: [
                                "scope:utils"
                            ]
                        },
                        {
                            sourceTag: "scope:ui",
                            onlyDependOnLibsWithTags: [
                                "scope:ui",
                                "scope:utils"
                            ]
                        },
                        {
                            sourceTag: "scope:data-access",
                            onlyDependOnLibsWithTags: [
                                "scope:data-access",
                                "scope:utils"
                            ]
                        },
                        {
                            sourceTag: "scope:features",
                            onlyDependOnLibsWithTags: [
                                "scope:features",
                                "scope:ui",
                                "scope:data-access",
                                "scope:utils"
                            ]
                        },
                        {
                            sourceTag: "scope:app",
                            onlyDependOnLibsWithTags: [
                                "scope:features",
                                "scope:ui",
                                "scope:data-access",
                                "scope:utils"
                            ]
                        },
                        {
                            sourceTag: "type:interfaces",
                            onlyDependOnLibsWithTags: [
                                "type:interfaces",
                                "type:util"
                            ]
                        }
                    ]
                }
            ]
        }
    },
    {
        files: [
            "**/*.ts",
            "**/*.tsx",
            "**/*.cts",
            "**/*.mts",
            "**/*.js",
            "**/*.jsx",
            "**/*.cjs",
            "**/*.mjs"
        ],
        // Override or add rules here
        rules: {}
    }
];
