# Versions and citations

## Naming and versions

Every part has a fixed name and two version markers:

| Marker | Example | Set by | Changes when |
|---|---|---|---|
| Name | `trappy-inator:chlamydomonas` | the author: project, then part | never; a renamed part keeps its old name as an alias |
| Generation | `g1` | the author, by hand | the part no longer fits older versions (its mating dimensions or interfaces change) |
| Revision | `a1b2c3d` | git, automatically | the last commit that changed the part's own files |

The revision is read from git when the website is built and shown under each model. It covers only the part's own
folder, so a part that has not changed keeps its revision while the rest of the repository moves on, and its STL
stays byte-identical. This works the same for parametric parts (`cad/parts/<part>/`) and STL parts
(`cad/frozen/<part>/`).

## Citing a part

> Chlamydomonas facsimile (`trappy-inator:chlamydomonas`, rev a1b2c3d),
> https://github.com/Trappy-Scopes/trappy-inator/tree/a1b2c3d/cad/parts/chlamydomonas

The link points at the exact commit, so it always shows the files as they were.

## Citing a configuration

A Playground link records only the parameters you changed. Together with the part name and revision it describes
exactly one model:

> Chlamydomonas facsimile (`trappy-inator:chlamydomonas`, rev a1b2c3d), configured at
> https://trappy-scopes.github.io/trappy-inator/playground/?cis_flagellum_length=8

The Playground shows this line under **Cite this configuration**, ready to copy.

## Releases (planned)

Each release of a project will be archived on Zenodo, which gives it a DOI. A paper can then cite the release DOI
together with the part name and revision.
