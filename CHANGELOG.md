# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.11.0](https://github.com/kagawagao/opas/compare/v0.10.1...v0.11.0) (2024-07-10)

### Features

- **plugins:app:** add api filter support ([d0cca54](https://github.com/kagawagao/opas/commit/d0cca54fa87b30363a3c157cd2c15163fad00f0d))

## [0.10.1](https://github.com/kagawagao/opas/compare/v0.10.0...v0.10.1) (2024-07-10)

### Bug Fixes

- **cli:** fix ts type checking error ([93654d2](https://github.com/kagawagao/opas/commit/93654d265d90c5d8e38bdd74ef2e84145761223c))

# [0.10.0](https://github.com/kagawagao/opas/compare/v0.9.2...v0.10.0) (2024-07-02)

### Features

- **cli:** add doc command ([d96a89b](https://github.com/kagawagao/opas/commit/d96a89b16cc33ebd7c5e25c5b5777467856a3fc2))

## [0.9.2](https://github.com/kagawagao/opas/compare/v0.9.1...v0.9.2) (2024-07-02)

### Bug Fixes

- **plugins:doc:** fix parameter type resolve ([fe97aca](https://github.com/kagawagao/opas/commit/fe97aca2ce23a86fdcc18c39ace81327146d4102))

## [0.9.1](https://github.com/kagawagao/opas/compare/v0.9.0...v0.9.1) (2024-06-20)

### Bug Fixes

- **cli:** fix cli require deps version ([2356fcc](https://github.com/kagawagao/opas/commit/2356fccfc7ccb1cc7cd7d6eef0ebc6ea054e8efe))

# [0.9.0](https://github.com/kagawagao/opas/compare/v0.8.1...v0.9.0) (2024-06-20)

### Features

- **core:** sort api default ([e1e1634](https://github.com/kagawagao/opas/commit/e1e16342dc2e404d179d52583aa3687e0e745a92))
- **plugins:app:** add custom service import path support ([e906a4f](https://github.com/kagawagao/opas/commit/e906a4f4fc3cff2ca499404f5f32c6c0e2d1adeb))

## [0.8.1](https://github.com/kagawagao/opas/compare/v0.8.0...v0.8.1) (2024-06-14)

### Bug Fixes

- **cli:** fix config type definition ([f8ac0e7](https://github.com/kagawagao/opas/commit/f8ac0e7dfc283c131230307517cfe33d89f01610))

# [0.8.0](https://github.com/kagawagao/opas/compare/v0.7.0...v0.8.0) (2024-06-12)

### Features

- **cli:** check file exist firstly and support overwrite ([eb1d125](https://github.com/kagawagao/opas/commit/eb1d125bc3199b48ae5a3732b6bc082bf84f3bfe))

# [0.7.0](https://github.com/kagawagao/opas/compare/v0.6.6...v0.7.0) (2024-06-12)

### Features

- **cli:** implement init command ([a4f839e](https://github.com/kagawagao/opas/commit/a4f839eca3dfbf5e2ed6a193c0f8096d27232de2))

## [0.6.6](https://github.com/kagawagao/opas/compare/v0.6.5...v0.6.6) (2024-06-01)

### Bug Fixes

- fix base url generate ([29fa151](https://github.com/kagawagao/opas/commit/29fa151219f7262e1c3e0c53b083537330210022))

## [0.6.5](https://github.com/kagawagao/opas/compare/v0.6.4...v0.6.5) (2024-06-01)

### Bug Fixes

- fix api render ([1c0fe82](https://github.com/kagawagao/opas/commit/1c0fe8221882d8096502cff07fd55c7623d44f71))

## [0.6.4](https://github.com/kagawagao/opas/compare/v0.6.3...v0.6.4) (2024-05-29)

### Bug Fixes

- **cli:** fix base url generate ([cf91a56](https://github.com/kagawagao/opas/commit/cf91a563eeca6538dcade67537f426744881e1bf))

## [0.6.3](https://github.com/kagawagao/opas/compare/v0.6.2...v0.6.3) (2024-05-26)

### Bug Fixes

- **helper:** fix v3 response extract field render ([66a88b0](https://github.com/kagawagao/opas/commit/66a88b04c57c76ac07577ff5522e1ed97d1e5d6a))

## [0.6.2](https://github.com/kagawagao/opas/compare/v0.6.1...v0.6.2) (2024-05-22)

### Bug Fixes

- **plugins:app:** fix url join ([403c022](https://github.com/kagawagao/opas/commit/403c022c9073997b1a8274b9625959abf477caeb))

## [0.6.1](https://github.com/kagawagao/opas/compare/v0.6.0...v0.6.1) (2024-05-20)

### Bug Fixes

- check field exist before extract ([1307444](https://github.com/kagawagao/opas/commit/1307444cff572f818dc02b4f4bca638c3538eac3))

# [0.6.0](https://github.com/kagawagao/opas/compare/v0.5.0...v0.6.0) (2024-05-08)

### Bug Fixes

- **plugins:definition:** ensure dir exists before write file ([99ea144](https://github.com/kagawagao/opas/commit/99ea144c596fb3db56892c38bb098435b2142a50))

### Features

- **core:** support runner configuration in object ([f8c7e4a](https://github.com/kagawagao/opas/commit/f8c7e4a678e743882b486a3c41aa3faf5e550305))

# [0.5.0](https://github.com/kagawagao/opas/compare/v0.4.1...v0.5.0) (2024-04-25)

### Features

- support customize request config type annotation ([a6879ac](https://github.com/kagawagao/opas/commit/a6879ac200f313742786fb303efd7e39b5d9e565))

## [0.4.1](https://github.com/kagawagao/opas/compare/v0.4.0...v0.4.1) (2024-04-25)

### Bug Fixes

- **cli:** fix postSchema support ([53dca52](https://github.com/kagawagao/opas/commit/53dca52948152e76222e599474c6c8ccd06fb742))

# [0.4.0](https://github.com/kagawagao/opas/compare/v0.3.2...v0.4.0) (2024-04-24)

### Features

- add postSchema support ([7dfef00](https://github.com/kagawagao/opas/commit/7dfef00587caa92834b20cab4a5d93d327184394))

## [0.3.2](https://github.com/kagawagao/opas/compare/v0.3.1...v0.3.2) (2024-04-15)

### Bug Fixes

- compatible with writing path under windows ([#49](https://github.com/kagawagao/opas/issues/49)) ([5342faa](https://github.com/kagawagao/opas/commit/5342faa5dc92030eb22baded96320387f978e9d8))

## [0.3.1](https://github.com/kagawagao/opas/compare/v0.3.0...v0.3.1) (2024-03-08)

**Note:** Version bump only for package opas

# [0.3.0](https://github.com/kagawagao/opas/compare/v0.2.0...v0.3.0) (2024-01-30)

### Features

- rename bin name ([1e62f77](https://github.com/kagawagao/opas/commit/1e62f77647756984ece2c68f5534ddb63c5894e2))

# [0.2.0](https://github.com/kagawagao/opas/compare/v0.1.1...v0.2.0) (2024-01-30)

### Features

- 支持 api tags ([b216647](https://github.com/kagawagao/opas/commit/b2166470d9fd18bf84eafc92ed1529f03c0448c8))

## [0.1.1](https://github.com/kagawagao/opas/compare/v0.1.0...v0.1.1) (2023-12-31)

### Bug Fixes

- fix quote ([467d0f2](https://github.com/kagawagao/opas/commit/467d0f282846e43d5a881bc1f571adef894df0d5))

# [0.1.0](https://github.com/kagawagao/opas/compare/v0.0.7...v0.1.0) (2023-12-31)

### Features

- support nested extract fields ([497e37d](https://github.com/kagawagao/opas/commit/497e37def83631246f02bce5b2b39d072d771ab6))

## [0.0.7](https://github.com/kagawagao/opas/compare/v0.0.6...v0.0.7) (2023-12-26)

### Bug Fixes

- fix write file mode ([0eca4aa](https://github.com/kagawagao/opas/commit/0eca4aa2d4045546c4493223b40cc7a6bc2ae7f1))

## [0.0.6](https://github.com/kagawagao/opas/compare/v0.0.5...v0.0.6) (2023-12-26)

**Note:** Version bump only for package opas

## [0.0.5](https://github.com/kagawagao/opas/compare/v0.0.4...v0.0.5) (2023-12-26)

### Bug Fixes

- **cli:** fix interface name ([6dfc659](https://github.com/kagawagao/opas/commit/6dfc659e4d4ae7b20cb8afb0e7cb1a5f0f8adba5))

## [0.0.4](https://github.com/kagawagao/opas/compare/v0.0.3...v0.0.4) (2023-12-26)

### Bug Fixes

- **cli:** fix output dir ([0264e0e](https://github.com/kagawagao/opas/commit/0264e0e20a7f07e5cbd4b5390c2c5190f38bbceb))

## [0.0.3](https://github.com/kagawagao/opas/compare/v0.0.2...v0.0.3) (2023-12-25)

### Bug Fixes

- fix publish config ([f5dbf88](https://github.com/kagawagao/opas/commit/f5dbf88593ff09fc9c07837985d7d248b6235d63))

## [0.0.2](https://github.com/kagawagao/opas/compare/v0.0.1...v0.0.2) (2023-12-25)

### Bug Fixes

- add missed pkg ([80534ff](https://github.com/kagawagao/opas/commit/80534ff2b9895545257ee7260fca515c5ca44b43))
