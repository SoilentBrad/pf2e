declare type DocumentConstructor<T extends foundry.abstract.Document = foundry.abstract.Document> = {
    new (data: T['data'], context?: DocumentModificationContext): T;

    /**
     * Present a Dialog form to create a new Document of this type.
     * Choose a name and a type from a select menu of types.
     * @param data Initial data with which to populate the creation form
     * @param [options] Positioning and sizing options for the resulting dialog
     * @return A Promise which resolves to the created Document
     */
    createDialog(data?: { folder?: string }, options?: FormApplicationOptions): Promise<Document>;
};

/**
 * The client-side document mixin which is used to extend the common BaseDocument.
 * This mixin provides the client-side interface for database operations and common document behaviors.
 * @mixin
 */
declare function ClientDocumentMixin<TDocument extends foundry.abstract.Document>(
    Base: DocumentConstructor<TDocument>,
): ClientDocumentMixin<TDocument> & DocumentConstructor<TDocument>;

declare type ClientDocumentMixin<TDocument extends foundry.abstract.Document> = {
    /**
     * A collection of Application instances which should be re-rendered whenever this document is updated.
     * The keys of this object are the application ids and the values are Application instances. Each
     * Application in this object will have its render method called by {@link Document#render}.
     * @see {@link Document#render}
     */
    apps: Record<string, Application>;

    /** A cached reference to the FormApplication instance used to configure this Document. */
    readonly _sheet: FormApplication | null;

    /** @override */
    _initialize(): void;

    /* -------------------------------------------- */
    /*  Properties                                  */
    /* -------------------------------------------- */

    /**
     * Return a reference to the parent Collection instance which contains this Document.
     */
    readonly collection: Collection<TDocument>;

    /** A reference to the Compendium Collection which contains this Document, if any, otherwise undefined. */
    readonly compendium: TDocument extends CompendiumDocument ? CompendiumCollection<TDocument> : undefined;

    /**
     * Return a reference to the Folder to which this Document belongs, if any.
     *
     * @example <caption>A Document may belong to a Folder</caption>
     * let folder = game.folders.entities[0];
     * let actor = await Actor.create({name: "New Actor", folder: folder.id});
     * console.log(actor.data.folder); // folder.id;
     * console.log(actor.folder); // folder;
     */
    readonly folder: Folder | null;

    /**
     * A boolean indicator for whether or not the current game User has ownership rights for this Document.
     * Different Document types may have more specialized rules for what constitutes ownership.
     */
    readonly isOwner: boolean;

    /** Test whether this Document is owned by any non-Gamemaster User. */
    readonly hasPlayerOwner: boolean;

    /** A boolean indicator for whether the current game User has exactly LIMITED visibility (and no greater). */
    readonly limited: boolean;

    /** Return a string which creates a dynamic link to this Document instance. */
    readonly link: string;

    /**
     * Return the permission level that the current game User has over this Document.
     * See the CONST.ENTITY_PERMISSIONS object for an enumeration of these levels.
     *
     * @example
     * game.user.id; // "dkasjkkj23kjf"
     * actor.data.permission; // {default: 1, "dkasjkkj23kjf": 2};
     * actor.permission; // 2
     */
    readonly permission: DocumentPermission;

    /** Lazily obtain a FormApplication instance used to configure this Document, or null if no sheet is available. */
    readonly sheet: object | null;

    /** A Universally Unique Identifier (uuid) for this Document instance. */
    readonly uuid: string;

    /**
     * A boolean indicator for whether or not the current game User has at least limited visibility for this Document.
     * Different Document types may have more specialized rules for what determines visibility.
     */
    readonly visible: boolean;

    /* -------------------------------------------- */
    /*  Methods                                     */
    /* -------------------------------------------- */

    /** Obtain the FormApplication class constructor which should be used to configure this Document. */
    readonly _getSheetClass: { new (...args: any[]): Function } | null;

    /**
     * Prepare data for the Document.
     * Begin by resetting the prepared data back to its source state.
     * Next prepare any embedded Documents and compute any derived data elements.
     */
    prepareData(): void;

    /** Prepare data related to this Document itself, before any embedded Documents or derived data is computed. */
    prepareBaseData(): void;

    /** Prepare all embedded Document instances which exist within this primary Document. */
    prepareEmbeddedEntities(): void;

    /**
     * Apply transformations or derivations to the values of the source data object.
     * Compute data fields whose values are not stored to the database.
     */
    prepareDerivedData(): void;

    /**
     * Render all of the Application instances which are connected to this document by calling their respective
     * @see Application#render
     * @param [force=false] Force rendering
     * @param [context={}] Optional context
     */
    render(force?: boolean, context?: RenderOptions): void;

    /**
     * Determine the sort order for this Document by positioning it relative a target sibling.
     * See SortingHelper.performIntegerSort for more details
     * @param [options] Sorting options provided to SortingHelper.performIntegerSort
     * @returns The Document after it has been re-sorted
     */
    sortRelative({
        target,
        siblings,
        sortKey,
        sortBefore,
        updateData,
    }: {
        target?: any;
        siblings?: any[];
        sortKey?: string;
        sortBefore?: boolean;
        updateData?: any;
    }): Promise<TDocument>;

    /* -------------------------------------------- */
    /*  Event Handlers                              */
    /* -------------------------------------------- */

    /** @override */
    _onCreate(data: foundry.abstract.DocumentSource, options: DocumentModificationContext, userId: string): void;

    /** @override */
    _onUpdate(data: foundry.abstract.DocumentSource, options: DocumentModificationContext, userId: string): void;

    /** @override */
    _onDelete(options: DocumentModificationContext, userId: string): void;

    /**
     * Preliminary actions taken before a set of embedded Documents in this parent Document are created.
     * @param embeddedName The name of the embedded Document type
     * @param result       An Array of created data objects
     * @param options      Options which modified the creation operation
     * @param userId       The ID of the User who triggered the operation
     */
    _preCreateEmbeddedDocuments(
        embeddedName: string,
        result: foundry.abstract.DocumentSource[],
        options: DocumentModificationContext,
        userId: string,
    ): void;

    /**
     * Follow-up actions taken after a set of embedded Documents in this parent Document are created.
     * @param embeddedName The name of the embedded Document type
     * @param documents    An Array of created Documents
     * @param result       An Array of created data objects
     * @param options      Options which modified the creation operation
     * @param userId       The ID of the User who triggered the operation
     */
    _onCreateEmbeddedDocuments(
        embeddedName: string,
        documents: TDocument[],
        result: TDocument['data']['_source'],
        options: DocumentModificationContext,
        userId: string,
    ): void;

    /**
     * Preliminary actions taken before a set of embedded Documents in this parent Document are updated.
     * @param embeddedName The name of the embedded Document type
     * @param result       An Array of incremental data objects
     * @param options      Options which modified the update operation
     * @param userId       The ID of the User who triggered the operation
     */
    _preUpdateEmbeddedDocuments(
        embeddedName: string,
        result: foundry.abstract.DocumentSource[],
        options: DocumentModificationContext,
        userId: string,
    ): void;

    /**
     * Follow-up actions taken after a set of embedded Documents in this parent Document are updated.
     * @param embeddedName   The name of the embedded Document type
     * @param documents  An Array of updated Documents
     * @param result       An Array of incremental data objects
     * @param options        Options which modified the update operation
     * @param userId         The ID of the User who triggered the operation
     */
    _onUpdateEmbeddedDocuments(
        embeddedName: string,
        documents: TDocument[],
        result: foundry.abstract.DocumentSource[],
        options: DocumentModificationContext,
        userId: string,
    ): void;

    /**
     * Preliminary actions taken before a set of embedded Documents in this parent Document are deleted.
     * @param embeddedName The name of the embedded Document type
     * @param result       An Array of document IDs being deleted
     * @param options      Options which modified the deletion operation
     * @param userId       The ID of the User who triggered the operation
     */
    _preDeleteEmbeddedDocuments(
        embeddedName: string,
        result: foundry.abstract.DocumentSource[],
        options: DocumentModificationContext,
        userId: string,
    ): void;

    /**
     * Follow-up actions taken after a set of embedded Documents in this parent Document are deleted.
     * @param embeddedName The name of the embedded Document type
     * @param documents    An Array of deleted Documents
     * @param result       An Array of document IDs being deleted
     * @param options      Options which modified the deletion operation
     * @param userId       The ID of the User who triggered the operation
     */
    _onDeleteEmbeddedDocuments(
        embeddedName: string,
        documents: TDocument[],
        result: foundry.abstract.DocumentSource[],
        options: DocumentModificationContext,
        userId: string,
    ): void;

    /**
     * Present a Dialog form to confirm deletion of this Document.
     * @param [options] Positioning and sizing options for the resulting dialog
     * @return A Promise which resolves to the deleted Document
     */
    deleteDialog(options?: object): Promise<TDocument>;

    /** Export entity data to a JSON file which can be saved by the client and later imported into a different session. */
    exportToJSON(): void;

    /**
     * Update this Document using a provided JSON string.
     * @param json JSON data string
     * @return The updated Document
     */
    importFromJSON(json: string): Promise<TDocument>;

    /** Render an import dialog for updating the data related to this Document through an exported JSON file */
    importFromJSONDialog(): Promise<void>;

    /**
     * Transform the Document data to be stored in a Compendium pack.
     * Remove any features of the data which are world-specific.
     * This function is asynchronous in case any complex operations are required prior to exporting.
     * @param [pack]   A specific pack being exported to
     * @return A data object of cleaned data suitable for compendium import
     * @memberof ClientDocumentMixin#
     */
    toCompendium(pack: CompendiumCollection<TDocument>): RawObject<TDocument['data']>;
} & TDocument;
