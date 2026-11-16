import nx from "@nx/eslint-plugin";
import baseConfig from "../../../eslint.config.mjs";

export default [
    ...nx.configs["flat/react"],
    ...baseConfig,
    {
        files: [
            "**/*.ts",
            "**/*.tsx",
            "**/*.js",
            "**/*.jsx"
        ],
        // Override or add rules here
        rules: {}
    },
    {
        ignores: [
            ".expo",
            "web-build",
            "cache",
            "dist",
            "storybook-static",
            "out-tsc",
            "test-output",
            "**/out-tsc"
        ]
    }
];
