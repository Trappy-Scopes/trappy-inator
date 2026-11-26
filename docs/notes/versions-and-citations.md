# Versions and citations

## Naming and versions

Every part has a fixed name and two version markers:

| Marker | Example | Set by | Changes when |
|---|---|---|---|
| Name | `trappy-inator:chlamydomonas` | the author: project, then part | never; a renamed part keeps its old name as an alias |
| Generation | `g1` | the author, by hand | the part no longer fits older versions (its mating dimensions or interfaces change) |
| Revision | `a1b2c3d` | git, automatically | the last commit that changed the part's own files |

Name and revision together make the part's **address**: `trappy-inator:chlamydomonas/cell@a1b2c3d`. The address
is enough to find the exact part: the project is a repository of the Trappy-Scopes organisation, the model lives at
`cad/parts/<model>/<model>.scad`, the part after the `/` is the model's `part` parameter, and the revision is the
commit. Leave out the part for the whole assembly (`trappy-inator:chlamydomonas@a1b2c3d`), and inside one project
leave out the project (`chlamydomonas/cell@a1b2c3d`). Projects use only the `main` branch, so a revision is always a commit on it.

The revision is read from git when the website is built and shown under each model. It covers only the part's own
folder, so a part that has not changed keeps its revision while the rest of the repository moves on, and its STL
stays byte-identical. This works the same for parametric parts (`cad/parts/<part>/`) and STL parts
(`cad/frozen/<part>/`).

## Citing a part

> Chlamydomonas facsimile (`trappy-inator:chlamydomonas@a1b2c3d`),
> https://github.com/Trappy-Scopes/trappy-inator/tree/a1b2c3d/cad/parts/chlamydomonas

The link points at the exact commit, so it always shows the files as they were.

## Citing a configuration

A Playground link records only the parameters you changed. Together with the part name and revision it describes
exactly one model:

> Chlamydomonas facsimile (`trappy-inator:chlamydomonas@a1b2c3d`), configured at
> https://trappy-scopes.github.io/trappy-inator/playground/?cis_flagellum_length=8

The Playground shows this line under **Cite this configuration**, ready to copy.

## Releases (planned)

Each release of a project will be archived on Zenodo, which gives it a DOI. A paper can then cite the release DOI
together with the part name and revision.

## Rendering an old version

The [Version archive](../archive.md) tab renders any committed version of a part from its address. Type
`chlamydomonas/cell@a1b2c3d` and the page fetches that exact `.scad` from GitHub, along with anything it includes, uses
or imports from the same commit, then renders it in the browser with the same OpenSCAD as the Playground. Nothing
extra is stored or built for this: the repository's history is the archive, so every version ever committed stays
available as long as the repository is public. A GitHub link to a `.scad` file also works, for files outside the
usual layout.

STL parts (`cad/frozen/`) have addresses too, but there is nothing to render; their files at a revision are at
`https://github.com/Trappy-Scopes/<project>/tree/<revision>/cad/frozen/<part>`.
