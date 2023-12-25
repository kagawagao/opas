declare namespace Artist {
    export interface Artist {
        artist_name?: string;
        artist_genre?: string;
        albums_recorded?: number;
        username: string;
    }
}
declare namespace Artist {
    /**
     * Limits the number of items on a page
     */
    export type PageLimit = number;
    /**
     * Specifies the page number of the artists to be displayed
     */
    export type PageNumber = number;
}
declare namespace Artist {
    namespace Artists {
        namespace Get {
            namespace Parameters {
                export type $0 = /* Limits the number of items on a page */ Artist.PageLimit;
                export type $1 = /* Specifies the page number of the artists to be displayed */ Artist.PageNumber;
            }
            namespace Responses {
                export type $200 = Artist.Artist[];
            }
        }
        namespace Post {
            export interface BodyParameters {
                artist?: Artist.Artist;
            }
            namespace Parameters {
                export type Artist = Artist.Artist;
            }
        }
    }
    namespace Artists$Username {
        namespace Get {
            namespace Parameters {
                export type Username = string;
            }
            export interface PathParameters {
                username: Artist.Username;
            }
            namespace Responses {
                export interface $200 {
                    artist_name?: string;
                    artist_genre?: string;
                    albums_recorded?: number;
                }
            }
        }
    }
}
declare interface QueryParameters {
    PageLimit?: /* Limits the number of items on a page */ Artist.PageLimit;
    PageNumber?: /* Specifies the page number of the artists to be displayed */ Artist.PageNumber;
}
declare namespace Artist {
    export interface $400Error {
        message?: string;
    }
}
